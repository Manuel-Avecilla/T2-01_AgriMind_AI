import { useEffect, useState } from 'react';

const VISTAS = new Map([
  ['inicio', { titulo: 'AgriMind AI · Agricultura de precisión', etiqueta: 'Inicio', tituloId: 'inicio-titulo' }],
  ['acceso', { titulo: 'AgriMind AI · Acceso', etiqueta: 'Acceso', tituloId: 'auth-titulo' }],
  ['panel', { titulo: 'AgriMind AI · Panel', etiqueta: 'Panel', tituloId: 'panel-titulo' }],
  ['privacidad', { titulo: 'AgriMind AI · Privacidad', etiqueta: 'Privacidad', tituloId: 'privacidad-titulo' }],
]);

function leerRuta() {
  const crudo = window.location.hash.replace(/^#\/?/, '');
  const [nombre, consulta = ''] = crudo.split('?');
  return {
    nombre: VISTAS.has(nombre) ? nombre : 'inicio',
    parametros: new URLSearchParams(consulta),
    foco: false,
  };
}

function irA(nombre) {
  const destino = `#/${nombre}`;
  if (window.location.hash !== destino) {
    history.replaceState(null, '', destino);
  }
}

/** Rutas por hash con las mismas redirecciones, título, anuncio y foco que antes. */
export function useRuta({ sesion, sesionConocida }) {
  const [ruta, setRuta] = useState(leerRuta);

  useEffect(() => {
    const alCambiar = () => setRuta({ ...leerRuta(), foco: true });
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);

  useEffect(() => {
    if (!sesionConocida) return;

    if (ruta.nombre === 'panel' && !sesion) {
      irA('acceso');
      setRuta({ nombre: 'acceso', parametros: new URLSearchParams(), foco: ruta.foco });
      return;
    }
    if (ruta.nombre === 'acceso' && sesion) {
      irA('panel');
      setRuta({ nombre: 'panel', parametros: new URLSearchParams(), foco: ruta.foco });
      return;
    }

    const vista = VISTAS.get(ruta.nombre);
    document.title = vista.titulo;

    const anuncio = document.getElementById('vista-anuncio');
    if (anuncio) anuncio.textContent = `Vista ${vista.etiqueta}`;

    if (ruta.foco) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.getElementById(vista.tituloId)?.focus({ preventScroll: true });
      setRuta((actual) => (actual.foco ? { ...actual, foco: false } : actual));
    }
  }, [ruta, sesion, sesionConocida]);

  return ruta;
}
