import { supabase } from '../supabaseClient.js';
import { evaluarParcela, sincronizarAlerta } from './alertas.js';

// Consultas y mutaciones de lecturas. Sin DOM: la interfaz decide qué mostrar.
// RLS filtra por auth.uid(); user_id lo rellena el default de la tabla.

export async function cargarHistorial(parcelaId) {
  const { data, error } = await supabase
    .from('lecturas')
    .select('id, humedad_suelo, ph, medido_en')
    .eq('parcela_id', parcelaId)
    .order('medido_en', { ascending: true })
    .limit(100);

  if (error) throw error;
  return data ?? [];
}

/**
 * Mantiene el orden original: insertar la lectura, actualizar la parcela y
 * sincronizar alertas. El error 23505 se gestiona en sincronizarAlerta.
 */
export async function guardarLectura(parcela, { humedad, ph, medidoEn }) {
  const evaluacion = evaluarParcela(humedad);

  const { error: errorLectura } = await supabase.from('lecturas').insert({
    parcela_id: parcela.id,
    humedad_suelo: humedad,
    ph: ph ?? null,
    medido_en: medidoEn,
  });
  if (errorLectura) throw errorLectura;

  const { error: errorParcela } = await supabase
    .from('parcelas')
    .update({ humedad_suelo: humedad, estado: evaluacion.estado })
    .eq('id', parcela.id);
  if (errorParcela) throw errorParcela;

  await sincronizarAlerta(parcela, evaluacion);
  return evaluacion;
}
