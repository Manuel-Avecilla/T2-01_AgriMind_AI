import { visibleNav } from './navegacion.js';

export function Inicio({ sesion, sesionConocida, ruta }) {
  return (
    <section id="inicio" aria-labelledby="inicio-titulo" className="flex-1" hidden={!(sesionConocida && ruta === 'inicio')}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-12">
          <div>
            <p className="m-0 text-sm font-semibold tracking-wide text-esmeralda-osc">Agricultura de precisión</p>
            <h1 id="inicio-titulo" tabIndex={-1} className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-marino sm:text-5xl">Decisiones de riego que se pueden explicar.</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-tinta-suave sm:text-lg">AgriMind AI convierte la humedad del suelo y las reglas agronómicas en avisos claros: qué ocurre, por qué ocurre y qué conviene hacer.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a data-nav="auth" href="#/acceso" hidden={!visibleNav('auth', sesion, sesionConocida)} className="btn primario w-full sm:w-auto">Entrar</a>
              <a data-nav="auth" href="#/acceso?tab=registro" hidden={!visibleNav('auth', sesion, sesionConocida)} className="btn secundario w-full sm:w-auto">Crear cuenta</a>
              <a data-nav="app" href="#/panel" hidden={!visibleNav('app', sesion, sesionConocida)} className="btn primario w-full sm:w-auto">Ir al panel</a>
            </div>
            <p className="mt-5 text-sm text-tinta-suave">Sin tarjetas de pago. Tus parcelas y tus datos, bajo tu cuenta.</p>
          </div>

          {/* El motif de franjas del logotipo se convierte en semáforo real. */}
          <div className="rounded-xl border border-borde bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-borde pb-3">
              <h2 className="m-0 text-base font-semibold text-marino">Estado del campo</h2>
              <span className="rounded-full bg-papel px-2.5 py-1 text-xs text-tinta-suave">Ejemplo</span>
            </div>
            <ul className="m-0 list-none space-y-4 p-0">
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-verde" aria-hidden="true"></span>
                <div>
                  <p className="m-0 font-semibold text-marino">Sin incidencias</p>
                  <p className="m-0 text-sm text-tinta-suave">Humedad 41 %. Riego programado con normalidad.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-amarillo" aria-hidden="true"></span>
                <div>
                  <p className="m-0 font-semibold text-marino">Humedad baja</p>
                  <p className="m-0 text-sm text-tinta-suave">27,5 %. Planifica el riego de esta semana.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-rojo" aria-hidden="true"></span>
                <div>
                  <p className="m-0 font-semibold text-marino">Humedad crítica</p>
                  <p className="m-0 text-sm text-tinta-suave">14 %. Causa: por debajo del umbral del 20 %.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 grid gap-6 border-t border-borde pt-10 sm:gap-8 md:grid-cols-3">
          <div className="rounded-xl p-1">
            <div className="inline-flex rounded-lg bg-esmeralda-suave p-2 text-esmeralda-osc">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 20V10m5 10V5m5 15v-7m5 7V8" strokeLinecap="round"/><path d="M2 20h20" strokeLinecap="round"/></svg>
            </div>
            <h2 className="mb-2 mt-4 text-lg font-semibold text-marino">Agricultura de precisión</h2>
            <p className="m-0 text-sm leading-relaxed text-tinta-suave">Cada parcela, su humedad y su historial en un mismo lugar. Menos hojas dispersas, más criterio para decidir.</p>
          </div>
          <div className="rounded-xl p-1">
            <div className="inline-flex rounded-lg bg-esmeralda-suave p-2 text-esmeralda-osc">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 3c3.5 4 6 7.1 6 10.4a6 6 0 0 1-12 0C6 10.1 8.5 7 12 3Z" strokeLinejoin="round"/><path d="M9 15.5c.6 1.4 1.7 2.2 3 2.3" strokeLinecap="round"/></svg>
            </div>
            <h2 className="mb-2 mt-4 text-lg font-semibold text-marino">Optimización del riego</h2>
            <p className="m-0 text-sm leading-relaxed text-tinta-suave">Reglas claras que indican cuándo regar y cuándo parar, para gastar agua solo donde hace falta.</p>
          </div>
          <div className="rounded-xl p-1">
            <div className="inline-flex rounded-lg bg-esmeralda-suave p-2 text-esmeralda-osc">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 3 4 6.5v5.2c0 4.4 3.2 7.9 8 9.3 4.8-1.4 8-4.9 8-9.3V6.5L12 3Z" strokeLinejoin="round"/><path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h2 className="mb-2 mt-4 text-lg font-semibold text-marino">Alertas explicables</h2>
            <p className="m-0 text-sm leading-relaxed text-tinta-suave">Cada aviso incluye su causa: qué dato lo originó y qué umbral se ha superado. Tú decides qué hacer.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
