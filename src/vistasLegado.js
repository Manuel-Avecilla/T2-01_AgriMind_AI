// Puente temporal de la Fase 1: markup literal de las vistas que aún no se
// migran a React. Se inyecta una vez desde App.jsx y se retira en las fases 2-4.
// Los identificadores se conservan tal cual porque los módulos vanilla los usan.

export const HTML_ACCESO = `
<!-- VISTA 2 · ACCESO ---------------------------------------------------- -->
  <section id="auth" aria-labelledby="auth-titulo" class="flex-1" hidden>
    <div class="mx-auto flex max-w-6xl items-center justify-center px-4 py-14 sm:px-6">
      <div class="auth-caja">
        <svg class="mx-auto mb-3 h-12 w-12" aria-hidden="true" focusable="false" viewBox="0 0 48 48">
          <path d="M27.5 4.5c-8.7 0-15.8 7-15.8 15.6 0 3.4 1.1 6.6 3 9.2v6.2c0 1.9 1.5 3.4 3.4 3.4h12.4V4.5h-.8Z" fill="#0f2a47"/>
          <circle cx="23.5" cy="17.5" r="4.2" fill="#f08a24"/>
          <g stroke="#f08a24" stroke-width="1.4" stroke-linecap="round">
            <path d="M23.5 9.5v2.2M16 17.5h2.2M28.8 17.5h2.2M18.2 12.2l1.6 1.6M28.8 12.2l-1.6 1.6"/>
          </g>
          <path d="M13 27.5h17v3H13z" fill="#2fbf86"/>
          <path d="M14.5 31.5h15.5v3H14.5z" fill="#1f9d63"/>
          <path d="M16 35.5h14v3H16z" fill="#16794d"/>
          <path d="M28 38.5c3.6-.6 6.2-2.7 7-6.2-3.7.3-6.4 2.4-7 6.2Z" fill="#2fbf86"/>
        </svg>
        <h1 id="auth-titulo" tabindex="-1" class="m-0 text-center text-2xl font-bold text-marino">AgriMind AI</h1>
        <p class="mb-6 mt-1 text-center text-sm text-tinta-suave">Tus parcelas y su estado de riego</p>

        <div role="tablist" aria-label="Acceso" class="mb-6 grid grid-cols-2 gap-1 border-b border-borde">
          <button type="button" id="auth-volver" role="tab" aria-controls="login" aria-selected="true" class="-mb-px border-b-2 border-esmeralda bg-transparent px-2 py-2.5 text-sm font-semibold text-esmeralda-osc">Iniciar sesión</button>
          <button type="button" id="auth-cambiar" role="tab" aria-controls="registro" aria-selected="false" tabindex="-1" class="-mb-px border-b-2 border-transparent bg-transparent px-2 py-2.5 text-sm font-semibold text-tinta-suave">Crear cuenta</button>
        </div>

        <button type="button" id="btn-google" class="btn btn-google w-full">
          <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.36-.18-2.02H12v3.83h5.4a4.62 4.62 0 0 1-2 3.03v2.5h3.23c1.89-1.74 2.97-4.3 2.97-7.34Z"/>
            <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.23-2.5c-.9.6-2.05.95-3.4.95-2.61 0-4.83-1.76-5.62-4.13H3.04v2.58A9.99 9.99 0 0 0 12 22Z"/>
            <path fill="#FBBC05" d="M6.38 13.89A6 6 0 0 1 6.06 12c0-.66.11-1.29.32-1.89V7.53H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.47l3.34-2.58Z"/>
            <path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.83 1.49l2.87-2.87C16.96 2.99 14.69 2 12 2A9.99 9.99 0 0 0 3.04 7.53l3.34 2.58c.79-2.37 3.01-4.15 5.62-4.15Z"/>
          </svg>
          <span>Continuar con Google</span>
        </button>

        <div class="auth-separador" aria-hidden="true"><span>o con tu correo</span></div>

        <div id="login" role="tabpanel" aria-labelledby="auth-volver">
          <form id="form-login" novalidate>
            <label for="login-email">Correo electrónico</label>
            <input id="login-email" type="email" required autocomplete="email" inputmode="email">

            <label for="login-password">Contraseña</label>
            <div class="campo-password">
              <input id="login-password" type="password" required minlength="6" autocomplete="current-password">
              <button type="button" id="toggle-login-password" class="btn-toggle-password" aria-controls="login-password" aria-pressed="false" aria-label="Mostrar contraseña">Mostrar</button>
            </div>

            <button type="submit" id="btn-login" class="btn primario mt-6 w-full">Entrar</button>
          </form>
        </div>

        <div id="registro" role="tabpanel" aria-labelledby="auth-cambiar" hidden>
          <form id="form-registro" novalidate>
            <label for="registro-nombre">Nombre</label>
            <input id="registro-nombre" type="text" maxlength="100" required autocomplete="name">

            <label for="registro-email">Correo electrónico</label>
            <input id="registro-email" type="email" required autocomplete="email" inputmode="email">

            <label for="registro-password">Contraseña</label>
            <div class="campo-password">
              <input id="registro-password" type="password" required minlength="6" autocomplete="new-password">
              <button type="button" id="toggle-registro-password" class="btn-toggle-password" aria-controls="registro-password" aria-pressed="false" aria-label="Mostrar contraseña">Mostrar</button>
            </div>
            <p class="ayuda mt-2">Mínimo 6 caracteres.</p>

            <button type="submit" id="btn-registro" class="btn primario mt-6 w-full">Crear cuenta</button>
          </form>
        </div>

        <p id="auth-mensaje" class="mensaje" role="status" aria-live="polite"></p>
        <p class="mb-0 mt-4 text-center text-xs text-tinta-suave">Tus datos son tuyos: puedes exportarlos a CSV cuando quieras.</p>
      </div>
    </div>
  </section>
`;

export const HTML_PANEL = `
<!-- VISTA 3 · PANEL ----------------------------------------------------- -->
  <section id="app" aria-labelledby="panel-titulo" class="flex-1" hidden>
    <div class="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div class="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id="panel-titulo" tabindex="-1" class="m-0 text-3xl font-bold tracking-tight text-marino">Panel</h1>
          <p class="mb-0 mt-1 text-tinta-suave">Estado de tus parcelas y alertas pendientes.</p>
        </div>
      </div>

      <dl class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div class="rounded border border-borde bg-white px-4 py-3">
          <dt class="text-sm text-tinta-suave">Parcelas</dt>
          <dd id="n-total" class="m-0 text-2xl font-bold text-marino">0</dd>
        </div>
        <div class="rounded border border-borde bg-white px-4 py-3">
          <dt class="text-sm text-tinta-suave">En verde</dt>
          <dd id="n-verde" class="m-0 text-2xl font-bold text-verde-osc">0</dd>
        </div>
        <div class="rounded border border-borde bg-white px-4 py-3">
          <dt class="text-sm text-tinta-suave">En amarillo</dt>
          <dd id="n-amarillo" class="m-0 text-2xl font-bold text-amarillo-osc">0</dd>
        </div>
        <div class="rounded border border-borde bg-white px-4 py-3">
          <dt class="text-sm text-tinta-suave">En rojo</dt>
          <dd id="n-rojo" class="m-0 text-2xl font-bold text-rojo-osc">0</dd>
        </div>
        <div class="rounded border border-borde bg-white px-4 py-3">
          <dt class="text-sm text-tinta-suave">Alertas activas</dt>
          <dd id="n-alertas" class="m-0 text-2xl font-bold text-rojo-osc">0</dd>
        </div>
      </dl>

      <section class="panel mb-6" aria-labelledby="titulo-alertas">
        <div class="listado-cabecera">
          <h2 id="titulo-alertas" class="m-0">Alertas activas</h2>
          <span id="n-alertas-panel" class="conteo" aria-hidden="true">0</span>
        </div>
        <p id="alertas-mensaje" class="mensaje" role="status" aria-live="polite"></p>
        <ul id="lista-alertas" class="m-0 list-none p-0"></ul>
        <p id="alertas-vacio" class="vacio">Sin alertas activas. Las lecturas crearán las que hagan falta.</p>
      </section>

      <main class="grid items-start gap-6 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
        <section class="panel lg:sticky lg:top-24" aria-labelledby="titulo-form">
          <h2 id="titulo-form">Añadir parcela</h2>
          <form id="form" novalidate>
            <input type="hidden" id="id">

            <label for="nombre">Nombre</label>
            <input id="nombre" type="text" maxlength="100" required autocomplete="off">

            <label for="cultivo">Cultivo</label>
            <input id="cultivo" type="text" maxlength="100" required autocomplete="off">

            <div class="fila">
              <div>
                <label for="superficie">Superficie (ha)</label>
                <input id="superficie" type="number" min="0.01" step="0.01" required>
              </div>
              <div>
                <label for="humedad">Humedad del suelo (%)</label>
                <input id="humedad" type="number" min="0" max="100" step="0.1" required>
              </div>
            </div>

            <fieldset class="grupo">
              <legend>Ubicación (opcional)</legend>
              <div class="fila">
                <div>
                  <label for="latitud">Latitud</label>
                  <input id="latitud" type="number" min="-90" max="90" step="any" inputmode="decimal" placeholder="37.7694">
                </div>
                <div>
                  <label for="longitud">Longitud</label>
                  <input id="longitud" type="number" min="-180" max="180" step="any" inputmode="decimal" placeholder="-3.7904">
                </div>
              </div>
              <p class="ayuda">Usa punto decimal. La ubicación permitirá consultar el tiempo de cada parcela.</p>
            </fieldset>

            <label for="estado">Estado (calculado)</label>
            <select id="estado" disabled>
              <option value="verde">Verde: todo en orden</option>
              <option value="amarillo">Amarillo: vigilar</option>
              <option value="rojo">Rojo: actuar ya</option>
            </select>
            <p class="ayuda">El semáforo se calcula solo con la humedad de cada lectura.</p>

            <label for="notas">Notas</label>
            <textarea id="notas" rows="3"></textarea>

            <p id="mensaje" class="mensaje" role="status" aria-live="polite"></p>

            <div class="acciones">
              <button type="submit" id="btn-guardar" class="btn primario">Añadir parcela</button>
              <button type="button" id="btn-cancelar" class="btn secundario" hidden>Cancelar</button>
            </div>
          </form>
        </section>

        <section class="panel" aria-labelledby="titulo-lista">
          <div class="listado-cabecera">
            <h2 id="titulo-lista">Parcelas</h2>
            <div class="acciones">
              <button type="button" id="btn-exportar-parcelas" class="btn secundario pequeno">Exportar CSV</button>
              <button type="button" id="btn-ejemplos" class="btn exemplo pequeno">Cargar parcelas de ejemplo</button>
            </div>
          </div>
          <div class="tabla-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cultivo</th>
                  <th class="num">Superficie</th>
                  <th class="num">Humedad</th>
                  <th class="num">Ubicación</th>
                  <th>Estado</th>
                  <th>Notas</th>
                  <th><span class="solo-lectores">Acciones</span></th>
                </tr>
              </thead>
              <tbody id="tbody"></tbody>
            </table>
          </div>
          <p id="vacio" class="vacio" hidden>Aún no hay parcelas. Añade la primera o carga las parcelas de ejemplo.</p>
        </section>
      </main>
    </div>
  </section>
`;

export const HTML_DIALOGO = `
<dialog id="dialog-lectura" class="dialogo-lectura" aria-labelledby="lectura-titulo">
    <div class="dialogo-cabecera">
      <h2 id="lectura-titulo">Registrar lectura</h2>
      <button type="button" id="btn-cerrar-lectura" class="btn secundario pequeno" aria-label="Cerrar ventana">Cerrar</button>
    </div>

    <form id="form-lectura" novalidate>
      <div class="fila">
        <div>
          <label for="lectura-humedad">Humedad del suelo (%)</label>
          <input id="lectura-humedad" type="number" min="0" max="100" step="0.1" required>
        </div>
        <div>
          <label for="lectura-ph">pH (opcional)</label>
          <input id="lectura-ph" type="number" min="0" max="14" step="0.1">
        </div>
      </div>

      <label for="lectura-fecha">Fecha y hora de la medición</label>
      <input id="lectura-fecha" type="datetime-local">

      <p id="lectura-mensaje" class="mensaje" role="status" aria-live="polite"></p>

      <div class="acciones">
        <button type="submit" id="btn-guardar-lectura" class="btn primario">Guardar lectura</button>
        <button type="button" id="btn-exportar-csv" class="btn secundario">Exportar CSV de esta parcela</button>
      </div>
    </form>

    <div class="historial">
      <h3>Historial de humedad</h3>
      <p id="lectura-stats" class="ayuda">Sin lecturas registradas.</p>
      <div class="grafico-caja">
        <canvas id="grafico-humedad" role="img" aria-label="Evolución de la humedad del suelo"></canvas>
      </div>
      <p id="grafico-vacio" class="vacio" hidden>Aún no hay lecturas. Registra la primera para ver la evolución.</p>
      <p id="historial-mensaje" class="mensaje" role="status" aria-live="polite"></p>
    </div>
  </dialog>
`;

