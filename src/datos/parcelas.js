import { supabase } from '../supabaseClient.js';
import { evaluarParcela, sincronizarAlerta } from './alertas.js';
import { generarLecturasEjemplo, parcelasEjemplo } from './datosEjemplo.js';

// Consultas y mutaciones de parcelas. Sin DOM: la interfaz decide qué mostrar.
// RLS filtra por auth.uid(); user_id lo rellena el default de la tabla.

export async function cargarParcelas() {
  const { data, error } = await supabase
    .from('parcelas')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function crearParcela(cuerpo) {
  const { error } = await supabase.from('parcelas').insert([cuerpo]);
  if (error) throw error;
}

export async function actualizarParcela(id, cuerpo) {
  const { error } = await supabase
    .from('parcelas')
    .update(cuerpo)
    .eq('id', id);
  if (error) throw error;
}

export async function borrarParcela(id) {
  const { error } = await supabase.from('parcelas').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Carga las parcelas de ejemplo con lecturas diarias y sus alertas coherentes.
 * user_id lo rellena el default de la tabla; RLS filtra por auth.uid().
 */
export async function insertarEjemplos() {
  const { data, error: errorParcelas } = await supabase
    .from('parcelas')
    .insert(parcelasEjemplo)
    .select('id, nombre, humedad_suelo, estado');
  if (errorParcelas) throw errorParcelas;

  const creadas = data ?? [];
  try {
    const lecturas = generarLecturasEjemplo(creadas);
    const { error: errorLecturas } = await supabase.from('lecturas').insert(lecturas);
    if (errorLecturas) throw errorLecturas;

    // La última lectura deja cada parcela en su estado; reutilizamos la misma
    // regla que guardarLectura() para no duplicar la lógica de alertas.
    await Promise.all(creadas.map((parcela) => (
      sincronizarAlerta(parcela, evaluarParcela(parcela.humedad_suelo))
    )));
  } catch (error) {
    // Evita un estado a medias: el cascade borra lecturas y alertas creadas.
    await Promise.allSettled(creadas.map((parcela) => borrarParcela(parcela.id)));
    throw error;
  }
}
