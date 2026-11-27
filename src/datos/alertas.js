import { supabase } from '../supabaseClient.js';

// Umbrales orientativos del proyecto, ajustables por cultivo. Compartidos con
// la gráfica de lecturas para que reglas y visualización no se descuadren.
export const UMBRALES = Object.freeze({
  critico: 20,
  bajo: 30,
  alto: 70,
  encharcamiento: 80,
});
const UMBRAL_LLUVIA = 60;

const formatoNumero = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });
const num = (valor) => formatoNumero.format(valor);

const SIN_LECTURA = Object.freeze({
  estado: 'verde',
  nivel: null,
  tipo: null,
  mensaje: 'Sin lectura de humedad',
  causa: null,
});

/**
 * Semáforo explicable. Función pura: no lee BD ni toca el DOM.
 * @param {number|string|null} humedad humedad del suelo en porcentaje
 * @param {{ probabilidadLluvia24h?: number|null }|null} prevision previsión de la Fase 6
 * @returns {{ estado: 'verde'|'amarillo'|'rojo', nivel: 'amarillo'|'rojo'|null,
 *             tipo: 'riego'|'drenaje'|null, mensaje: string, causa: string|null }}
 */
export function evaluarParcela(humedad, prevision = null) {
  if (humedad == null || humedad === '') return { ...SIN_LECTURA };

  const valor = Number(humedad);
  if (!Number.isFinite(valor)) return { ...SIN_LECTURA };

  const lluvia = Number(prevision?.probabilidadLluvia24h);
  const vaALlover = prevision != null && Number.isFinite(lluvia) && lluvia >= UMBRAL_LLUVIA;

  if (valor < UMBRALES.critico) {
    return {
      estado: 'rojo',
      nivel: 'rojo',
      tipo: 'riego',
      mensaje: 'Humedad crítica: riega hoy',
      causa: `Humedad ${num(valor)} % < umbral ${num(UMBRALES.critico)} % (crítico)`,
    };
  }

  if (valor < UMBRALES.bajo) {
    const causa = `Humedad ${num(valor)} % entre ${num(UMBRALES.critico)} % y ${num(UMBRALES.bajo)} % (baja)`;
    return {
      estado: 'amarillo',
      nivel: 'amarillo',
      tipo: 'riego',
      mensaje: vaALlover ? 'Espera a la lluvia prevista' : 'Humedad baja: planifica el riego',
      causa: vaALlover
        ? `${causa}; lluvia prevista ${num(lluvia)} % ≥ ${num(UMBRAL_LLUVIA)} % en 24 h`
        : causa,
    };
  }

  if (valor <= UMBRALES.alto) {
    return {
      estado: 'verde',
      nivel: null,
      tipo: null,
      mensaje: 'Sin incidencias',
      causa: null,
    };
  }

  if (valor <= UMBRALES.encharcamiento) {
    return {
      estado: 'amarillo',
      nivel: 'amarillo',
      tipo: 'drenaje',
      mensaje: 'Exceso de agua: evita regar',
      causa: `Humedad ${num(valor)} % > umbral ${num(UMBRALES.alto)} % (alta)`,
    };
  }

  return {
    estado: 'rojo',
    nivel: 'rojo',
    tipo: 'drenaje',
    mensaje: 'Encharcamiento: revisa el drenaje',
    causa: `Humedad ${num(valor)} % > umbral ${num(UMBRALES.encharcamiento)} % (encharcamiento)`,
  };
}

// ---------------------------------------------------------------------------
// Persistencia. RLS filtra por auth.uid(); user_id se rellena con el default.
// ---------------------------------------------------------------------------

export async function cargarAlertasActivas() {
  const { data, error } = await supabase
    .from('alertas')
    .select('id, parcela_id, nivel, tipo, mensaje, causa, estado, created_at, parcelas ( nombre, cultivo )')
    .eq('estado', 'activa')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

async function actualizarAlertaActiva(parcelaId, evaluacion) {
  const { error } = await supabase
    .from('alertas')
    .update({ nivel: evaluacion.nivel, mensaje: evaluacion.mensaje, causa: evaluacion.causa })
    .eq('parcela_id', parcelaId)
    .eq('tipo', evaluacion.tipo)
    .eq('estado', 'activa');

  if (error) throw error;
}

/**
 * Aplica el flujo de la sección 6 tras una lectura:
 * verde -> resolver activas; amarillo/rojo -> crear si no hay activa del mismo
 * tipo, o actualizarla si cambió el nivel, el mensaje o la causa.
 */
export async function sincronizarAlerta(parcela, evaluacion) {
  if (evaluacion.estado === 'verde') {
    const { error } = await supabase
      .from('alertas')
      .update({ estado: 'resuelta' })
      .eq('parcela_id', parcela.id)
      .eq('estado', 'activa');
    if (error) throw error;
    return;
  }

  const { data: activa, error: errorBusqueda } = await supabase
    .from('alertas')
    .select('id, nivel, mensaje, causa')
    .eq('parcela_id', parcela.id)
    .eq('tipo', evaluacion.tipo)
    .eq('estado', 'activa')
    .maybeSingle();
  if (errorBusqueda) throw errorBusqueda;

  if (activa) {
    const cambio = activa.nivel !== evaluacion.nivel
      || activa.mensaje !== evaluacion.mensaje
      || activa.causa !== evaluacion.causa;
    if (cambio) await actualizarAlertaActiva(parcela.id, evaluacion);
    return;
  }

  const { error: errorInsercion } = await supabase.from('alertas').insert({
    parcela_id: parcela.id,
    nivel: evaluacion.nivel,
    tipo: evaluacion.tipo,
    mensaje: evaluacion.mensaje,
    causa: evaluacion.causa,
  });

  if (!errorInsercion) return;
  if (errorInsercion.code === '23505') {
    // Otra pestaña ganó la carrera: el índice parcial impidió el duplicado.
    await actualizarAlertaActiva(parcela.id, evaluacion);
    return;
  }
  throw errorInsercion;
}

async function cambiarEstadoAlerta(id, estado) {
  const { error } = await supabase
    .from('alertas')
    .update({ estado })
    .eq('id', id)
    .eq('estado', 'activa');
  if (error) throw error;
}

export const resolverAlerta = (id) => cambiarEstadoAlerta(id, 'resuelta');
export const descartarAlerta = (id) => cambiarEstadoAlerta(id, 'descartada');
