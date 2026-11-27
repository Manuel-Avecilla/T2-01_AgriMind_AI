// Puente temporal de la Fase 1: markup del diálogo de lecturas, que aún se
// inicializa con módulos vanilla. Se retira en la Fase 4.

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
