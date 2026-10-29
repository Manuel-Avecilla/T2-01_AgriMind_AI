const API = '/api/parcelas';
const $ = (id) => document.getElementById(id);

const campos = {
  id: $('id'), nombre: $('nombre'), cultivo: $('cultivo'),
  superficie: $('superficie'), humedad: $('humedad'),
  estado: $('estado'), notas: $('notas'),
};
const form = $('form');
const mensaje = $('mensaje');
let parcelas = [];

const ETIQUETAS = { verde: 'Verde', amarillo: 'Amarillo', rojo: 'Rojo' };

async function api(url, opciones = {}) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opciones });
  if (res.status === 204) return null;
  const datos = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(datos.error || 'No se pudo completar la operación.');
  return datos;
}

function avisar(texto, esError = false) {
  mensaje.textContent = texto;
  mensaje.classList.toggle('error', esError);
}

// Pinta la tabla y el resumen de la cabecera
function pintar() {
  const tbody = $('tbody');
  tbody.replaceChildren();

  for (const p of parcelas) {
    const tr = document.createElement('tr');
    if (String(p.id) === campos.id.value) tr.classList.add('editando');

    const celda = (texto, clase) => {
      const td = document.createElement('td');
      td.textContent = texto;
      if (clase) td.className = clase;
      return td;
    };

    tr.append(celda(p.nombre), celda(p.cultivo));
    tr.append(celda(`${p.superficie_ha} ha`, 'num'), celda(`${p.humedad_suelo} %`, 'num'));

    const tdEstado = document.createElement('td');
    const insignia = document.createElement('span');
    insignia.className = `insignia ${p.estado}`;
    insignia.textContent = ETIQUETAS[p.estado];
    tdEstado.append(insignia);
    tr.append(tdEstado, celda(p.notas, 'notas'));

    const tdBotones = document.createElement('td');
    tdBotones.className = 'botones';
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
  for (const e of ['verde', 'amarillo', 'rojo']) {
    $(`n-${e}`).textContent = parcelas.filter((p) => p.estado === e).length;
  }
}

async function cargar() {
  try {
    parcelas = await api(API);
    pintar();
  } catch (err) {
    avisar(err.message, true);
  }
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
  campos.humedad.value = p.humedad_suelo;
  campos.estado.value = p.estado;
  campos.notas.value = p.notas;
  $('titulo-form').textContent = `Editar ${p.nombre}`;
  $('btn-guardar').textContent = 'Guardar cambios';
  $('btn-cancelar').hidden = false;
  avisar('');
  pintar();
  campos.nombre.focus();
}

async function borrarParcela(p) {
  if (!confirm(`¿Borrar la parcela «${p.nombre}»? Esta acción no se puede deshacer.`)) return;
  try {
    await api(`${API}/${p.id}`, { method: 'DELETE' });
    if (campos.id.value === String(p.id)) reiniciarFormulario();
    avisar(`Parcela «${p.nombre}» borrada.`);
    await cargar();
  } catch (err) {
    avisar(err.message, true);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;

  const editando = campos.id.value !== '';
  const cuerpo = {
    nombre: campos.nombre.value,
    cultivo: campos.cultivo.value,
    superficie_ha: campos.superficie.value,
    humedad_suelo: campos.humedad.value,
    estado: campos.estado.value,
    notas: campos.notas.value,
  };

  try {
    await api(editando ? `${API}/${campos.id.value}` : API, {
      method: editando ? 'PUT' : 'POST',
      body: JSON.stringify(cuerpo),
    });
    reiniciarFormulario();
    avisar(editando ? 'Cambios guardados.' : 'Parcela añadida.');
    await cargar();
  } catch (err) {
    avisar(err.message, true);
  }
});

$('btn-cancelar').addEventListener('click', () => {
  reiniciarFormulario();
  avisar('');
  pintar();
});

cargar();
