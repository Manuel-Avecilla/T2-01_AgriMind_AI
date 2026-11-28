import { REPOSITORIO_GITHUB } from './enlaces.js';

function Apartado({ titulo, children }) {
  return (
    <section className="rounded-xl border border-borde bg-white p-5 sm:p-6">
      <h2 className="m-0 text-base font-semibold text-marino sm:text-lg">{titulo}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-tinta-suave sm:text-base">{children}</div>
    </section>
  );
}

export function Privacidad({ visible }) {
  return (
    <section id="privacidad" aria-labelledby="privacidad-titulo" className="flex-1" hidden={!visible}>
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <a
          href="#/inicio"
          className="inline-flex min-h-11 items-center gap-2 rounded-md px-1 text-sm font-medium text-marino no-underline transition-colors hover:text-esmeralda-osc hover:underline"
        >
          <span aria-hidden="true">←</span> Volver al inicio
        </a>

        <p className="mb-0 mt-6 text-sm font-semibold tracking-wide text-esmeralda-osc">Información sobre tus datos</p>
        <h1 id="privacidad-titulo" tabIndex={-1} className="mb-0 mt-2 text-3xl font-bold tracking-tight text-marino sm:text-4xl">Privacidad</h1>
        <p className="mb-0 mt-1 text-sm text-tinta-suave">Última actualización: 28 de noviembre de 2026.</p>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-tinta-suave sm:text-lg">
          AgriMind AI guarda únicamente la información necesaria para que gestiones tus parcelas y recibas avisos de riego. Esta página explica qué datos se tratan, para qué se usan y cómo puedes eliminarlos.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Apartado titulo="Datos de la cuenta">
            <p>Correo electrónico e identificador interno que genera Supabase Auth al crear la cuenta, además del nombre opcional del perfil.</p>
            <p>No pedimos documentos de identidad, teléfono ni datos bancarios: la aplicación no tiene pagos.</p>
          </Apartado>

          <Apartado titulo="Datos de parcelas y lecturas">
            <p>Nombre, cultivo, superficie, humedad del suelo, coordenadas (opcionales) y notas de cada parcela.</p>
            <p>Cada medición guarda humedad, pH (opcional) y fecha. Los avisos se calculan con umbrales y se conservan como alertas asociadas a la parcela.</p>
          </Apartado>

          <Apartado titulo="Para qué usamos la información">
            <p>Para mostrar el panel, dibujar el historial de humedad, exportar tus datos a CSV y avisarte cuando una parcela necesita atención.</p>
            <p>El semáforo se calcula en tu navegador a partir de la humedad; la aplicación no decide automáticamente cuándo regar.</p>
          </Apartado>

          <Apartado titulo="Con quién se comparten">
            <p>Supabase aloja la base de datos y gestiona la autenticación; Vercel publica la interfaz. Solo reciben los datos necesarios para esos servicios.</p>
            <p>No vendemos ni cedemos tus datos a terceros con fines publicitarios.</p>
          </Apartado>

          <Apartado titulo="Conservación y borrado">
            <p>Tus datos permanecen mientras la cuenta esté activa. Puedes editar o borrar parcelas y exportarlas desde el panel.</p>
            <p>Al borrar una parcela se eliminan también sus lecturas y alertas. Para dar de baja la cuenta completa, usa el enlace de contacto de abajo.</p>
          </Apartado>

          <Apartado titulo="Sesión y almacenamiento">
            <p>Guardamos el estado de la sesión en tu navegador para mantenerte identificado. No usamos cookies de seguimiento ni analítica propia.</p>
            <p>Las coordenadas se guardan para una futura consulta del tiempo; hoy no se envían a ningún servicio meteorológico.</p>
          </Apartado>
        </div>

        <div className="mt-4 rounded-xl border border-esmeralda-suave bg-esmeralda-suave/60 p-5 sm:p-6">
          <h2 className="m-0 text-base font-semibold text-marino sm:text-lg">¿Necesitas eliminar tu cuenta?</h2>
          <p className="mb-0 mt-2 max-w-2xl text-sm leading-relaxed text-tinta-suave sm:text-base">
            Puedes borrar tus parcelas desde el panel. Para solicitar la eliminación completa de la cuenta y del perfil, abre un aviso en el repositorio del proyecto.
          </p>
          <a
            href={REPOSITORIO_GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-11 items-center rounded-md px-1 text-sm font-semibold text-esmeralda-osc no-underline hover:underline"
          >
            Abrir el repositorio en GitHub <span className="sr-only">(se abre en una pestaña nueva)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
