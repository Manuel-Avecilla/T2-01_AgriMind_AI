import { ENLACES, hrefDe, visibleNav } from './navegacion.js';

export function Pie({ sesion, sesionConocida, ruta }) {
  return (
    <footer className="mt-auto border-t border-borde bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-tinta-suave sm:px-6 lg:px-8">
        <p className="m-0">AgriMind AI es una aplicación de agricultura de precisión del proyecto T2-01. Tus datos permanecen en tu cuenta.</p>
        <nav aria-label="Navegación del pie" className="flex flex-wrap gap-4">
          {ENLACES.map(({ nav, ruta: destino, texto }) => (
            <a
              key={nav}
              data-nav={nav}
              href={hrefDe(destino)}
              hidden={!visibleNav(nav, sesion, sesionConocida)}
              aria-current={ruta === destino ? 'page' : undefined}
              className="text-marino no-underline hover:underline"
            >
              {texto}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
