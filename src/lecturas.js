import { Chart } from 'chart.js/auto';
import { supabase } from './supabaseClient.js';
import { evaluarParcela, sincronizarAlerta, UMBRALES } from './alertas.js';

const $ = (id) => document.getElementById(id);

const COLORES_ESTADO = { verde: '#1f9d63', amarillo: '#e0a100', rojo: '#d64545' };
const formatoNumero = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });
const formatoFecha = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
});

let dialogo;
let form;
let campos;
let grafico;
let parcelaActual = null;
let lecturas = [];
let onCambio = async () => {};

function ahoraLocal() {
  const ahora = new Date();
  return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000)
    .toISOString().slice(0, 16);
}

function avisar(texto, esError = false) {
  const destino = $('lectura-mensaje');
  destino.textContent = texto;
  destino.classList.toggle('error', esError);
}

function avisarHistorial(texto, esError = false) {
  const destino = $('historial-mensaje');
  destino.textContent = texto;
  destino.classList.toggle('error', esError);
}

function nombreArchivo(nombre) {
  return nombre.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'parcela';
}

// ---------------------------------------------------------------------------
// CSV (compatible con Excel en español: BOM, separador ';' y comillas dobles)
// ---------------------------------------------------------------------------

export function descargarCsv(cabeceras, filas, nombreBase) {
  const escapar = (valor) => `"${String(valor ?? '').replaceAll('"', '""')}"`;
  const contenido = [cabeceras, ...filas]
    .map((fila) => fila.map(escapar).join(';'))
    .join('\r\n');

  const url = URL.createObjectURL(new Blob(['\uFEFF', contenido], { type: 'text/csv;charset=utf-8;' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `${nombreBase}.csv`;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function exportarLecturas() {
  if (!parcelaActual) return;
  descargarCsv(
    ['fecha', 'humedad_suelo_%', 'ph', 'estado'],
    lecturas.map((lectura) => [
      lectura.medido_en,
      lectura.humedad_suelo,
      lectura.ph ?? '',
      evaluarParcela(lectura.humedad_suelo).estado,
    ]),
    `lecturas-${nombreArchivo(parcelaActual.nombre)}`
  );
}

export function exportarParcelas(parcelas) {
  descargarCsv(
    ['nombre', 'cultivo', 'superficie_ha', 'latitud', 'longitud', 'humedad_suelo_%', 'estado', 'notas'],
    parcelas.map((parcela) => [
      parcela.nombre,
      parcela.cultivo,
      parcela.superficie_ha,
      parcela.latitud ?? '',
      parcela.longitud ?? '',
      parcela.humedad_suelo ?? '',
      parcela.estado,
      parcela.notas ?? '',
    ]),
    'parcelas'
  );
}

// ---------------------------------------------------------------------------
// Gráfica del historial. El único momento visual fuerte del panel: las franjas
// de umbral convierten la curva en el propio semáforo, sin plugin externo.
// ---------------------------------------------------------------------------

const bandasUmbral = {
  id: 'bandasUmbral',
  beforeDatasetsDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea || !scales?.y) return;

    const franjas = [
      [0, UMBRALES.critico, 'rgba(214, 69, 69, 0.10)'],
      [UMBRALES.critico, UMBRALES.bajo, 'rgba(224, 161, 0, 0.10)'],
      [UMBRALES.bajo, UMBRALES.alto, 'rgba(31, 157, 99, 0.10)'],
      [UMBRALES.alto, UMBRALES.encharcamiento, 'rgba(224, 161, 0, 0.10)'],
      [UMBRALES.encharcamiento, 100, 'rgba(214, 69, 69, 0.10)'],
    ];

    ctx.save();
    for (const [desde, hasta, color] of franjas) {
      const yArriba = scales.y.getPixelForValue(hasta);
      const yAbajo = scales.y.getPixelForValue(desde);
      ctx.fillStyle = color;
      ctx.fillRect(
        chartArea.left,
        Math.min(yArriba, yAbajo),
        chartArea.right - chartArea.left,
        Math.abs(yAbajo - yArriba)
      );
    }
    ctx.restore();
  },
};

function dibujarGrafico() {
  grafico?.destroy();

  grafico = new Chart($('grafico-humedad').getContext('2d'), {
    type: 'line',
    data: {
      labels: lecturas.map((lectura) => formatoFecha.format(new Date(lectura.medido_en))),
      datasets: [{
        label: 'Humedad del suelo (%)',
        data: lecturas.map((lectura) => Number(lectura.humedad_suelo)),
        borderColor: '#1f9d63',
        backgroundColor: 'rgba(31, 157, 99, 0.12)',
        pointBackgroundColor: lecturas.map(
          (lectura) => COLORES_ESTADO[evaluarParcela(lectura.humedad_suelo).estado]
        ),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1.5,
        pointRadius: 4,
        tension: 0.25,
        fill: true,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: { callback: (valor) => `${valor} %`, stepSize: 20 },
        },
        x: { ticks: { maxTicksLimit: 6 } },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            afterLabel: (punto) => {
              const lectura = lecturas[punto.dataIndex];
              return lectura?.ph != null ? `pH ${lectura.ph}` : '';
            },
          },
        },
      },
    },
    plugins: [bandasUmbral],
  });

  $('grafico-vacio').hidden = lecturas.length > 0;
}

function pintarEstadisticas() {
  if (lecturas.length === 0) {
    $('lectura-stats').textContent = 'Sin lecturas registradas.';
    return;
  }

  const valores = lecturas.map((lectura) => Number(lectura.humedad_suelo));
  const ultima = valores.at(-1);
  $('lectura-stats').textContent =
    `${lecturas.length} lectura${lecturas.length === 1 ? '' : 's'} · ` +
    `última ${formatoNumero.format(ultima)} % · ` +
    `mín ${formatoNumero.format(Math.min(...valores))} % · ` +
    `máx ${formatoNumero.format(Math.max(...valores))} %`;
}

async function cargarHistorial() {
  const { data, error } = await supabase
    .from('lecturas')
    .select('id, humedad_suelo, ph, medido_en')
    .eq('parcela_id', parcelaActual.id)
    .order('medido_en', { ascending: true })
    .limit(100);

  if (error) throw error;
  lecturas = data ?? [];
  pintarEstadisticas();
  dibujarGrafico();
}

// ---------------------------------------------------------------------------
// Registro de lecturas
// ---------------------------------------------------------------------------

async function guardarLectura(evento) {
  evento.preventDefault();
  if (!form.reportValidity()) return;

  const humedad = Number(campos.humedad.value);
  const textoPh = campos.ph.value.trim();
  const medidoEn = campos.fecha.value
    ? new Date(campos.fecha.value).toISOString()
    : new Date().toISOString();

  const boton = $('btn-guardar-lectura');
  boton.disabled = true;
  avisar('Guardando lectura…');

  try {
    const evaluacion = evaluarParcela(humedad);
    const lectura = {
      parcela_id: parcelaActual.id,
      humedad_suelo: humedad,
      ph: textoPh === '' ? null : Number(textoPh),
      medido_en: medidoEn,
    };

    const { error: errorLectura } = await supabase.from('lecturas').insert(lectura);
    if (errorLectura) throw errorLectura;

    const { error: errorParcela } = await supabase
      .from('parcelas')
      .update({ humedad_suelo: humedad, estado: evaluacion.estado })
      .eq('id', parcelaActual.id);
    if (errorParcela) throw errorParcela;

    await sincronizarAlerta(parcelaActual, evaluacion);

    parcelaActual.humedad_suelo = humedad;
    parcelaActual.estado = evaluacion.estado;

    avisar(`Lectura guardada. ${evaluacion.mensaje}.`);
    await cargarHistorial();
    await onCambio();

    campos.humedad.value = humedad;
    campos.ph.value = '';
    campos.fecha.value = ahoraLocal();
  } catch (error) {
    avisar(error.message, true);
    // Puede haberse guardado la lectura pero fallado el update: sincronizar UI.
    await onCambio().catch(() => {});
  } finally {
    boton.disabled = false;
  }
}

async function abrirDialogo(parcela, enfocarFormulario) {
  parcelaActual = parcela;
  $('lectura-titulo').textContent = `Medir ${parcela.nombre}`;
  form.reset();
  campos.humedad.value = parcela.humedad_suelo ?? '';
  campos.fecha.value = ahoraLocal();
  avisar('');
  avisarHistorial('');

  dialogo.showModal();
  try {
    await cargarHistorial();
  } catch (error) {
    avisarHistorial(error.message, true);
  }
  if (enfocarFormulario) campos.humedad.focus();
}

export function abrirRegistro(parcela) {
  return abrirDialogo(parcela, true);
}

export function abrirHistorial(parcela) {
  return abrirDialogo(parcela, false);
}

export function iniciarLecturas({ onCambio: callback } = {}) {
  onCambio = callback ?? (async () => {});
  dialogo = $('dialog-lectura');
  form = $('form-lectura');
  campos = {
    humedad: $('lectura-humedad'),
    ph: $('lectura-ph'),
    fecha: $('lectura-fecha'),
  };

  form.addEventListener('submit', guardarLectura);
  $('btn-cerrar-lectura').addEventListener('click', () => dialogo.close());
  $('btn-exportar-csv').addEventListener('click', exportarLecturas);
  dialogo.addEventListener('close', () => {
    grafico?.destroy();
    grafico = null;
    parcelaActual = null;
    lecturas = [];
  });
}
