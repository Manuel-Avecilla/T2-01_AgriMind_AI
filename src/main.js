import '@fontsource-variable/public-sans';
import './styles.css';
import { supabase } from './supabaseClient.js';
import { cerrarSesion, iniciarFormulariosAuth, obtenerNombre } from './auth.js';
import { iniciarParcelas, recargarParcelas } from './parcelas.js';
import { iniciarPanelAlertas, recargarAlertas } from './alertas.js';
import { iniciarLecturas } from './lecturas.js';
import { render, iniciarRouter } from './router.js';

const $ = (id) => document.getElementById(id);

const nombreUsuario = $('nombre-usuario');

let fase5Iniciada = false;

function limpiarPanel() {
  $('tbody').replaceChildren();
  $('lista-alertas').replaceChildren();
  for (const id of ['n-total', 'n-verde', 'n-amarillo', 'n-rojo', 'n-alertas', 'n-alertas-panel']) {
    $(id).textContent = '0';
  }
  $('vacio').hidden = false;
  $('alertas-vacio').hidden = false;
  if ($('dialog-lectura')?.open) $('dialog-lectura').close();
}

async function recargarPanel() {
  await Promise.all([recargarParcelas(), recargarAlertas()]);
}

async function alCambiarSesion(evento, session) {
  if (!['INITIAL_SESSION', 'SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'].includes(evento)) return;

  render(session);

  if (!session) {
    nombreUsuario.textContent = 'Agricultor';
    limpiarPanel();
    return;
  }

  if (!fase5Iniciada) {
    iniciarPanelAlertas();
    iniciarLecturas({ onCambio: recargarPanel });
    iniciarParcelas({ onCambio: recargarPanel });
    fase5Iniciada = true;
  }

  try {
    nombreUsuario.textContent = await obtenerNombre(session.user);
  } catch (error) {
    console.warn('No se pudo cargar el nombre del perfil:', error.message);
    nombreUsuario.textContent = session.user.email?.split('@')[0] ?? 'Agricultor';
  }

  await recargarPanel();
}

$('btn-logout').addEventListener('click', async () => {
  try {
    await cerrarSesion();
  } catch (error) {
    console.error('No se pudo cerrar la sesión:', error.message);
  }
});

iniciarFormulariosAuth();
iniciarRouter();

// El evento INITIAL_SESSION llega al suscribirnos y ya trae la sesión guardada.
supabase.auth.onAuthStateChange((evento, session) => {
  void alCambiarSesion(evento, session);
});
