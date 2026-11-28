import { REPOSITORIO_GITHUB } from './enlaces.js';
import { Logo } from './Logo.jsx';

const claseEnlace =
  'inline-flex min-h-11 items-center gap-2 rounded-md px-1 text-sm font-medium text-marino no-underline transition-colors hover:text-esmeralda-osc hover:underline';

export function Pie({ ruta }) {
  const anio = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-borde bg-white">
      <div className="contenedor-ancho py-7 sm:py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
          <div className="flex max-w-xl items-start gap-3">
            <Logo className="mt-0.5 h-8 w-8 shrink-0" />
            <div>
              <p className="m-0 font-bold text-marino">AgriMind AI</p>
              <p className="mb-0 mt-1 text-sm leading-relaxed text-tinta-suave">
                Agricultura de precisión para decidir cuándo regar con criterios explicables. Tus parcelas y lecturas permanecen en tu cuenta.
              </p>
            </div>
          </div>

          <nav aria-label="Enlaces del pie" className="flex flex-col gap-1 sm:items-end">
            <a
              href="#/privacidad"
              aria-current={ruta === 'privacidad' ? 'page' : undefined}
              className={`${claseEnlace}${ruta === 'privacidad' ? ' text-esmeralda-osc' : ''}`}
            >
              Privacidad
            </a>
            <a
              href={REPOSITORIO_GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className={claseEnlace}
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
              Ver código en GitHub
              <span className="sr-only">(se abre en una pestaña nueva)</span>
            </a>
          </nav>
        </div>

        <div className="mt-6 flex flex-col gap-1 border-t border-borde pt-4 text-xs text-tinta-suave sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0">© {anio} AgriMind AI · Proyecto T2-01</p>
          <p className="m-0">Datos en Supabase · Interfaz en Vercel</p>
        </div>
      </div>
    </footer>
  );
}
