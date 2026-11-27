import { useCallback, useEffect, useRef } from 'react';
import { iniciarFormulariosAuth, mostrarFormularioAuth } from './auth.js';
import { Cabecera } from './componentes/Cabecera.jsx';
import { Inicio } from './componentes/Inicio.jsx';
import { Logo } from './componentes/Logo.jsx';
import { Pie } from './componentes/Pie.jsx';
import { useRuta } from './hooks/useRuta.js';
import { useSesion } from './hooks/useSesion.js';
import { HTML_ACCESO, HTML_DIALOGO, HTML_PANEL } from './vistasLegado.js';

const $ = (id) => document.getElementById(id);

function limpiarPanel() {
  $('tbody').replaceChildren();
  $('lista-alertas').replaceChildren();
  for (const id of ['n-total', 'n-verde', 'n-amarillo', 'n-rojo', 'n-alertas', 'n-alertas-panel']) {
    const nodo = $(id);
    if (nodo) nodo.textContent = '0';
  }
  const vacio = $('vacio');
  const alertasVacio = $('alertas-vacio');
  if (vacio) vacio.hidden = false;
  if (alertasVacio) alertasVacio.hidden = false;
  if ($('dialog-lectura')?.open) $('dialog-lectura').close();
}

export default function App() {
  const { sesion, sesionConocida, nombre, cerrarSesion } = useSesion();
  const ruta = useRuta({ sesion, sesionConocida });
  const accesoRef = useRef(null);
  const panelRef = useRef(null);
  const modulosRef = useRef(Promise.resolve(null));

  const recargarPanel = useCallback(async () => {
    const modulos = await modulosRef.current;
    if (!modulos) return;
    await Promise.all([modulos.parcelas.recargarParcelas(), modulos.alertas.recargarAlertas()]);
  }, []);

  // Los módulos vanilla se importan después de inyectar el markup: parcelas.js
  // captura campos del DOM en el momento de cargarse.
  useEffect(() => {
    let vivo = true;
    modulosRef.current = (async () => {
      const [alertas, lecturas, parcelas] = await Promise.all([
        import('./alertas.js'),
        import('./lecturas.js'),
        import('./parcelas.js'),
      ]);
      if (!vivo) return null;
      iniciarFormulariosAuth();
      alertas.iniciarPanelAlertas();
      lecturas.iniciarLecturas({ onCambio: recargarPanel });
      parcelas.iniciarParcelas({ onCambio: recargarPanel });
      return { alertas, parcelas };
    })();
    return () => { vivo = false; };
  }, [recargarPanel]);

  // Las vistas puente se muestran con las mismas reglas del router anterior.
  useEffect(() => {
    const mostrar = (ref, nombreVista) => {
      const nodo = ref.current?.firstElementChild;
      if (nodo) nodo.hidden = !(sesionConocida && ruta.nombre === nombreVista);
    };
    mostrar(accesoRef, 'acceso');
    mostrar(panelRef, 'panel');
  }, [ruta.nombre, sesionConocida]);

  // ?tab=registro selecciona la pestaña del acceso sin mover el foco.
  useEffect(() => {
    if (!sesionConocida || ruta.nombre !== 'acceso') return;
    let vivo = true;
    (async () => {
      const modulos = await modulosRef.current;
      if (vivo && modulos) {
        mostrarFormularioAuth(ruta.parametros.get('tab') === 'registro' ? 'registro' : 'login');
      }
    })();
    return () => { vivo = false; };
  }, [ruta.nombre, ruta.parametros, sesionConocida]);

  // Cada sesión aplicada recarga el panel; sin sesión se limpia como antes.
  useEffect(() => {
    if (!sesionConocida) return;
    let vivo = true;
    (async () => {
      const modulos = await modulosRef.current;
      if (!vivo || !modulos) return;
      if (!sesion) {
        limpiarPanel();
        return;
      }
      await recargarPanel();
    })();
    return () => { vivo = false; };
  }, [sesion, sesionConocida, recargarPanel]);

  return (
    <>
      <Cabecera
        sesion={sesion}
        sesionConocida={sesionConocida}
        ruta={ruta.nombre}
        nombre={nombre}
        onCerrarSesion={cerrarSesion}
      />

      <div id="vista-anuncio" className="sr-only" role="status" aria-live="polite"></div>

      {!sesionConocida && (
        <div id="app-boot" className="boot" role="status" aria-live="polite" aria-label="Comprobando sesión">
          <div className="boot-caja">
            <Logo className="boot-logo" />
            <p className="boot-texto">Comprobando sesión…</p>
          </div>
        </div>
      )}

      <Inicio sesion={sesion} sesionConocida={sesionConocida} ruta={ruta.nombre} />

      <div className="contents" ref={accesoRef} dangerouslySetInnerHTML={{ __html: HTML_ACCESO }} />
      <div className="contents" ref={panelRef} dangerouslySetInnerHTML={{ __html: HTML_PANEL }} />
      <div className="contents" dangerouslySetInnerHTML={{ __html: HTML_DIALOGO }} />

      <Pie sesion={sesion} sesionConocida={sesionConocida} ruta={ruta.nombre} />
    </>
  );
}
