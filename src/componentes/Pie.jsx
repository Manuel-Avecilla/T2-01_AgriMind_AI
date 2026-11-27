import { ENLACES, hrefDe, visibleNav } from './navegacion.js';

export function Pie({ sesion, sesionConocida, ruta }) {
  return (
    <footer className="mt-auto border-t border-borde bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-tinta-suave sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p className="m-0 max-w-2xl">AgriMind AI es una aplicación de agricultura de precisión del proyecto T2-01. Tus datos permanecen en tu cuenta.</p>
        <nav aria-label="Navegación del pie" className="flex flex-wrap gap-x-4 gap-y-2">
          {ENLACES.map(({ nav, ruta: destino, texto }) => {
            const activo = ruta === destino;
            return (
              <a
                key={nav}
                data-nav={nav}
                href={hrefDe(destino)}
                hidden={!visibleNav(nav, sesion, sesionConocida)}
                aria-current={activo ? 'page' : undefined}
                className={`inline-flex min-h-11 items-center rounded-md px-1 font-medium no-underline transition-colors ${
                  activo ? 'text-esmeralda-osc' : 'text-marino hover:text-esmeralda-osc hover:underline'
                }`}
              >
                {texto}
              </a>
            );
          })}
        </nav>
      </div>
    </footer>
  );
}
