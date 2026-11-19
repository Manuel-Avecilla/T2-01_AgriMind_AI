import '@fontsource-variable/public-sans';
import './styles.css';
import { supabase } from './supabaseClient.js';
import { cerrarSesion, iniciarFormulariosAuth, obtenerNombre } from './auth.js';
import { iniciarParcelas, recargarParcelas } from './parcelas.js';

const $ = (id) => document.getElementById(id);

const vistaAuth = $('auth');
const vistaApp = $('app');
const nombreUsuario = $('nombre-usuario');

let parcelasIniciadas = false;

function mostrarVista(haySesion) {
  vistaAuth.hidden = haySesion;
  vistaApp.hidden = !haySesion;
}

async function alCambiarSesion(evento, session) {
  if (!['INITIAL_SESSION', 'SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'].includes(evento)) return;

  mostrarVista(Boolean(session));

  if (!session) {
    nombreUsuario.textContent = 'Agricultor';
    return;
  }

  if (!parcelasIniciadas) {
    iniciarParcelas();
    parcelasIniciadas = true;
  }

  try {
    nombreUsuario.textContent = await obtenerNombre(session.user);
  } catch (error) {
    console.warn('No se pudo cargar el nombre del perfil:', error.message);
    nombreUsuario.textContent = session.user.email?.split('@')[0] ?? 'Agricultor';
  }

  await recargarParcelas();
}

$('btn-logout').addEventListener('click', async () => {
  try {
    await cerrarSesion();
  } catch (error) {
    console.error('No se pudo cerrar la sesión:', error.message);
  }
});

iniciarFormulariosAuth();

// El evento INITIAL_SESSION llega al suscribirnos y ya trae la sesión guardada.
supabase.auth.onAuthStateChange((evento, session) => {
  void alCambiarSesion(evento, session);
});
