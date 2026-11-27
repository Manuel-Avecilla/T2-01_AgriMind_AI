import { Acceso } from './componentes/Acceso.jsx';
import { Cabecera } from './componentes/Cabecera.jsx';
import { Inicio } from './componentes/Inicio.jsx';
import { Logo } from './componentes/Logo.jsx';
import { Panel } from './componentes/Panel.jsx';
import { Pie } from './componentes/Pie.jsx';
import { usePanel } from './hooks/usePanel.js';
import { useRuta } from './hooks/useRuta.js';
import { useSesion } from './hooks/useSesion.js';

export default function App() {
  const { sesion, sesionConocida, nombre, cerrarSesion } = useSesion();
  const ruta = useRuta({ sesion, sesionConocida });
  const { parcelas, alertas, cargando, errorParcelas, errorAlertas, recargar } = usePanel({ sesion, sesionConocida });

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

      <Acceso
        visible={sesionConocida && ruta.nombre === 'acceso'}
        tabSolicitado={ruta.nombre === 'acceso'
          ? (ruta.parametros.get('tab') === 'registro' ? 'registro' : 'login')
          : null}
      />

      <Panel
        visible={sesionConocida && ruta.nombre === 'panel'}
        sesion={sesion}
        parcelas={parcelas}
        alertas={alertas}
        cargando={cargando}
        errorParcelas={errorParcelas}
        errorAlertas={errorAlertas}
        recargar={recargar}
      />

      <Pie sesion={sesion} sesionConocida={sesionConocida} ruta={ruta.nombre} />
    </>
  );
}
