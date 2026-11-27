// Puente temporal de la Fase 1: markup literal de las vistas que aún no se
// migran a React. Se inyecta una vez desde App.jsx y se retira en las fases 3-4.
// Los identificadores se conservan tal cual porque los módulos vanilla los usan.

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

