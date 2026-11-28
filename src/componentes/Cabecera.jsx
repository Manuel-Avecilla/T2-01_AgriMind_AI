import { useState } from 'react';
import { Logo } from './Logo.jsx';
import { claseNav, ENLACES, hrefDe, visibleNav } from './navegacion.js';

export function Cabecera({ sesion, sesionConocida, ruta, nombre, numeroAlertas = 0, onCerrarSesion }) {
  const [saliendo, setSaliendo] = useState(false);

  async function cerrar() {
    if (saliendo) return;
    setSaliendo(true);
    try {
      await onCerrarSesion();
    } catch (error) {
      console.error('No se pudo cerrar la sesión:', error.message);
    } finally {
      setSaliendo(false);
    }
  }

  return (
    <header className="cabecera sticky top-0 z-30 border-b border-borde bg-white/95 backdrop-blur-sm">
      <div className="contenedor-ancho flex flex-wrap items-center justify-between gap-3 py-3">
        <a href="#/inicio" className="flex min-h-11 items-center gap-2.5 rounded-md text-marino no-underline">
          <Logo />
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-tight">AgriMind AI</span>
            <span className="hidden text-xs font-normal text-tinta-suave sm:block">Agricultura de precisión</span>
          </span>
        </a>

        <nav aria-label="Navegación principal" className="order-3 flex w-full items-center gap-1 border-t border-borde pt-2 sm:order-none sm:w-auto sm:border-0 sm:pt-0">
          {ENLACES.map(({ nav, ruta: destino, texto }) => {
            const activo = ruta === destino;
            const conAlertas = nav === 'app' && numeroAlertas > 0;
            const etiqueta = conAlertas
              ? `${texto}, ${numeroAlertas} alerta${numeroAlertas === 1 ? '' : 's'} activa${numeroAlertas === 1 ? '' : 's'}`
              : undefined;
            return (
              <a
                key={nav}
                data-nav={nav}
                href={hrefDe(destino)}
                hidden={!visibleNav(nav, sesion, sesionConocida)}
                aria-current={activo ? 'page' : undefined}
                aria-label={etiqueta}
                className={claseNav(activo)}
              >
                {texto}
                {conAlertas && (
                  <span aria-hidden="true" className="inline-flex min-w-5 items-center justify-center rounded-full bg-rojo px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
                    {numeroAlertas > 99 ? '99+' : numeroAlertas}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        <div data-nav="app" hidden={!visibleNav('app', sesion, sesionConocida)} className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-esmeralda-suave text-sm font-bold text-esmeralda-osc">
              {(nombre || '?').trim().charAt(0).toUpperCase()}
            </span>
            <span className="hidden text-sm text-tinta-suave md:inline">Hola, <strong className="font-semibold text-marino">{nombre}</strong></span>
          </div>
          <button type="button" onClick={cerrar} disabled={saliendo} aria-busy={saliendo || undefined} className="btn secundario pequeno">
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" strokeLinecap="round" />
            </svg>
            {saliendo ? 'Saliendo…' : 'Cerrar sesión'}
          </button>
        </div>
      </div>
    </header>
  );
}
