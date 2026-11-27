import { useEffect, useRef, useState } from 'react';
import {
  cerrarSesion,
  escucharCambiosAuth,
  obtenerNombre,
  obtenerSesionInicial,
} from '../auth.js';

const EVENTOS = ['INITIAL_SESSION', 'SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', 'USER_UPDATED'];

function nombreFallback(user) {
  const meta = user?.user_metadata ?? {};
  return meta.nombre || meta.full_name || meta.name || user?.email?.split('@')[0] || 'Agricultor';
}

/**
 * Resuelve la sesión con getSession() antes de pintar, ignora el
 * INITIAL_SESSION posterior del listener y serializa los cambios en una cola.
 */
export function useSesion() {
  const [sesion, setSesion] = useState(null);
  const [sesionConocida, setSesionConocida] = useState(false);
  const [nombre, setNombre] = useState('Agricultor');
  const colaRef = useRef(Promise.resolve());
  const inicialResueltaRef = useRef(false);

  useEffect(() => {
    let vivo = true;
    let subscription = null;

    async function aplicarNombre(actual) {
      if (!actual) {
        setNombre('Agricultor');
        return;
      }
      try {
        setNombre(await obtenerNombre(actual.user));
      } catch (error) {
        console.warn('No se pudo cargar el nombre del perfil:', error.message);
        setNombre(nombreFallback(actual.user));
      }
    }

    async function bootstrap() {
      let inicial;
      try {
        inicial = await obtenerSesionInicial();
      } catch (error) {
        console.error('No se pudo obtener la sesión inicial:', error);
        inicial = null;
      }
      if (!vivo) return;
      inicialResueltaRef.current = true;
      setSesion(inicial);
      setSesionConocida(true);
      await aplicarNombre(inicial);
    }

    // El listener se registra después del bootstrap, como en el arranque anterior.
    bootstrap().then(() => {
      if (!vivo) return;
      subscription = escucharCambiosAuth((evento, nuevaSesion) => {
        if (!EVENTOS.includes(evento)) return;
        if (evento === 'INITIAL_SESSION' && inicialResueltaRef.current) return;

        colaRef.current = colaRef.current
          .then(async () => {
            if (!vivo) return;
            setSesion(nuevaSesion ?? null);
            setSesionConocida(true);
            await aplicarNombre(nuevaSesion ?? null);
          })
          .catch((error) => {
            console.error('Error al aplicar el estado de sesión:', error);
          });
      });
    });

    return () => {
      vivo = false;
      subscription?.unsubscribe();
    };
  }, []);

  return { sesion, sesionConocida, nombre, cerrarSesion };
}
