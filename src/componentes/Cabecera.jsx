import { useState } from 'react';
import { Logo } from './Logo.jsx';
import { claseNav, ENLACES, hrefDe, visibleNav } from './navegacion.js';

export function Cabecera({ sesion, sesionConocida, ruta, nombre, onCerrarSesion }) {
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
            return (
              <a
                key={nav}
                data-nav={nav}
                href={hrefDe(destino)}
                hidden={!visibleNav(nav, sesion, sesionConocida)}
                aria-current={activo ? 'page' : undefined}
                className={claseNav(activo)}
              >
                {texto}
              </a>
            );
          })}
        </nav>

        <div data-nav="app" hidden={!visibleNav('app', sesion, sesionConocida)} className="flex items-center gap-3">
          <span className="hidden text-sm text-tinta-suave md:inline">Hola, <strong className="font-semibold text-marino">{nombre}</strong></span>
          <button type="button" onClick={cerrar} disabled={saliendo} aria-busy={saliendo || undefined} className="btn secundario pequeno">
            {saliendo ? 'Saliendo…' : 'Cerrar sesión'}
          </button>
        </div>
      </div>
    </header>
  );
}
