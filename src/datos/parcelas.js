import { supabase } from '../supabaseClient.js';
import { parcelasEjemplo } from './datosEjemplo.js';

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

export async function insertarEjemplos() {
  const { error } = await supabase.from('parcelas').insert(parcelasEjemplo);
  if (error) throw error;
}
