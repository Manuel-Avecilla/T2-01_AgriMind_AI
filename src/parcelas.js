import { supabase } from './supabaseClient.js';
import { parcelasEjemplo } from './datosEjemplo.js';

const $ = (id) => document.getElementById(id);

const campos = {
  id: $('id'),
  nombre: $('nombre'),
  cultivo: $('cultivo'),
  superficie: $('superficie'),
  humedad: $('humedad'),
  latitud: $('latitud'),
  longitud: $('longitud'),
  estado: $('estado'),
  notas: $('notas'),
};

const ETIQUETAS = { verde: 'Verde', amarillo: 'Amarillo', rojo: 'Rojo' };

let form;
let mensaje;
let parcelas = [];

function avisar(texto, esError = false) {
  mensaje.textContent = texto;
  mensaje.classList.toggle('error', esError);
}

function celda(texto, clase, etiqueta) {
  const td = document.createElement('td');
  td.textContent = texto;
  if (clase) td.className = clase;
  if (etiqueta) td.dataset.label = etiqueta;
  return td;
}

// Pinta la tabla y el resumen de la cabecera
function pintar() {
  const tbody = $('tbody');
  tbody.replaceChildren();

  for (const p of parcelas) {
    const tr = document.createElement('tr');
    if (p.id === campos.id.value) tr.classList.add('editando');

    const ubicacion = p.latitud != null && p.longitud != null
      ? `${Number(p.latitud).toFixed(4)}, ${Number(p.longitud).toFixed(4)}`
      : '—';
    const humedad = p.humedad_suelo == null ? '—' : `${Number(p.humedad_suelo)} %`;

    tr.append(
      celda(p.nombre, null, 'Nombre'),
      celda(p.cultivo, null, 'Cultivo'),
      celda(`${Number(p.superficie_ha)} ha`, 'num', 'Superficie'),
      celda(humedad, 'num', 'Humedad'),
      celda(ubicacion, 'num ubicacion', 'Ubicación')
    );

    const tdEstado = celda('', null, 'Estado');
    const insignia = document.createElement('span');
    insignia.className = `insignia ${p.estado}`;
    insignia.textContent = ETIQUETAS[p.estado] ?? p.estado;
    tdEstado.append(insignia);
    tr.append(tdEstado, celda(p.notas ?? '', 'notas', 'Notas'));

    const tdBotones = celda('', 'botones', 'Acciones');
    const editar = document.createElement('button');
    editar.type = 'button';
    editar.className = 'btn secundario pequeno';
    editar.textContent = 'Editar';
    editar.setAttribute('aria-label', `Editar ${p.nombre}`);
    editar.addEventListener('click', () => empezarEdicion(p));

    const borrar = document.createElement('button');
    borrar.type = 'button';
    borrar.className = 'btn peligro pequeno';
    borrar.textContent = 'Borrar';
    borrar.setAttribute('aria-label', `Borrar ${p.nombre}`);
    borrar.addEventListener('click', () => borrarParcela(p));

    tdBotones.append(editar, borrar);
    tr.append(tdBotones);
    tbody.append(tr);
  }

  $('vacio').hidden = parcelas.length > 0;
  $('n-total').textContent = parcelas.length;
  for (const estado of ['verde', 'amarillo', 'rojo']) {
    $(`n-${estado}`).textContent = parcelas.filter((p) => p.estado === estado).length;
  }
}

async function recargar() {
  const { data, error } = await supabase
    .from('parcelas')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  parcelas = data ?? [];
  pintar();
}

function reiniciarFormulario() {
  form.reset();
  campos.id.value = '';
  $('titulo-form').textContent = 'Añadir parcela';
  $('btn-guardar').textContent = 'Añadir parcela';
  $('btn-cancelar').hidden = true;
}

function empezarEdicion(p) {
  campos.id.value = p.id;
  campos.nombre.value = p.nombre;
  campos.cultivo.value = p.cultivo;
  campos.superficie.value = p.superficie_ha;
  campos.humedad.value = p.humedad_suelo ?? '';
  campos.latitud.value = p.latitud ?? '';
  campos.longitud.value = p.longitud ?? '';
  campos.estado.value = p.estado;
  campos.notas.value = p.notas ?? '';
  $('titulo-form').textContent = `Editar ${p.nombre}`;
  $('btn-guardar').textContent = 'Guardar cambios';
  $('btn-cancelar').hidden = false;
  avisar('');
  pintar();
  campos.nombre.focus();
}

function leerCuerpo() {
  const opcional = (valor) => {
    const texto = valor.trim();
    return texto === '' ? null : Number(texto);
  };

  return {
    nombre: campos.nombre.value.trim(),
    cultivo: campos.cultivo.value.trim(),
    superficie_ha: Number(campos.superficie.value),
    humedad_suelo: Number(campos.humedad.value),
    latitud: opcional(campos.latitud.value),
    longitud: opcional(campos.longitud.value),
    estado: campos.estado.value,
    notas: campos.notas.value.trim(),
  };
}

async function borrarParcela(p) {
  if (!confirm(`¿Borrar la parcela «${p.nombre}»? Esta acción no se puede deshacer.`)) return;
  try {
    const { error } = await supabase.from('parcelas').delete().eq('id', p.id);
    if (error) throw error;
    if (campos.id.value === p.id) reiniciarFormulario();
    avisar(`Parcela «${p.nombre}» borrada.`);
    await recargar();
  } catch (err) {
    avisar(err.message, true);
  }
}

async function cargarEjemplos() {
  if (!confirm('Se añadirán las 3 parcelas de ejemplo a tu cuenta. ¿Continuar?')) return;
  try {
    const { error } = await supabase.from('parcelas').insert(parcelasEjemplo);
    if (error) throw error;
    avisar('Parcelas de ejemplo cargadas.');
    await recargar();
  } catch (err) {
    avisar(err.message, true);
  }
}

export function iniciarParcelas() {
  form = $('form');
  mensaje = $('mensaje');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const editando = campos.id.value !== '';
    const cuerpo = leerCuerpo();

    try {
      let resultado;
      if (editando) {
        resultado = await supabase
          .from('parcelas')
          .update(cuerpo)
          .eq('id', campos.id.value);
      } else {
        resultado = await supabase.from('parcelas').insert([cuerpo]);
      }
      if (resultado.error) throw resultado.error;

      reiniciarFormulario();
      avisar(editando ? 'Cambios guardados.' : 'Parcela añadida.');
      await recargar();
    } catch (err) {
      avisar(err.message, true);
    }
  });

  $('btn-cancelar').addEventListener('click', () => {
    reiniciarFormulario();
    avisar('');
    pintar();
  });

  $('btn-ejemplos').addEventListener('click', cargarEjemplos);

  recargar().catch((err) => avisar(err.message, true));
}
