import '@fontsource-variable/public-sans';
import './styles.css';
import {
  cerrarSesion,
  escucharCambiosAuth,
  iniciarFormulariosAuth,
  obtenerNombre,
  obtenerSesionInicial,
} from './auth.js';
import { iniciarParcelas, recargarParcelas } from './parcelas.js';
import { iniciarPanelAlertas, recargarAlertas } from './alertas.js';
import { iniciarLecturas } from './lecturas.js';
import { iniciarRouter, render } from './router.js';

const $ = (id) => document.getElementById(id);

const nombreUsuario = $('nombre-usuario');
const boot = $('app-boot');

let fase5Iniciada = false;
let sesionActual = null;
let inicialResuelta = false;
let colaSesion = Promise.resolve();

function ocultarBoot() {
  if (boot) boot.hidden = true;
}

function limpiarPanel() {
  $('tbody').replaceChildren();
  $('lista-alertas').replaceChildren();
  for (const id of ['n-total', 'n-verde', 'n-amarillo', 'n-rojo', 'n-alertas', 'n-alertas-panel']) {
    const nodo = $(id);
    if (nodo) nodo.textContent = '0';
  }
  const vacio = $('vacio');
  const alertasVacio = $('alertas-vacio');
  if (vacio) vacio.hidden = false;
  if (alertasVacio) alertasVacio.hidden = false;
  if ($('dialog-lectura')?.open) $('dialog-lectura').close();
}

async function recargarPanel() {
  await Promise.all([recargarParcelas(), recargarAlertas()]);
}

function asegurarFase5() {
  if (fase5Iniciada) return;
  iniciarPanelAlertas();
  iniciarLecturas({ onCambio: recargarPanel });
  iniciarParcelas({ onCambio: recargarPanel });
  fase5Iniciada = true;
}

async function aplicarSesion(session, { foco = false } = {}) {
  sesionActual = session ?? null;
  render(sesionActual, { foco, conocido: true });
  ocultarBoot();

  if (!sesionActual) {
    nombreUsuario.textContent = 'Agricultor';
    limpiarPanel();
    return;
  }

  asegurarFase5();

  try {
    nombreUsuario.textContent = await obtenerNombre(sesionActual.user);
  } catch (error) {
    console.warn('No se pudo cargar el nombre del perfil:', error.message);
    const meta = sesionActual.user?.user_metadata ?? {};
    nombreUsuario.textContent = meta.nombre || meta.full_name || meta.name || sesionActual.user?.email?.split('@')[0] || 'Agricultor';
  }

  await recargarPanel();
}

function procesarCambioSesion(evento, session) {
  if (!['INITIAL_SESSION', 'SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(evento)) {
    return;
  }

  // El bootstrap resuelve la sesión inicial con getSession() para pintar sin
  // parpadeos. Ignoramos el INITIAL_SESSION posterior del listener para evitar
  // doble render/carga.
  if (evento === 'INITIAL_SESSION' && inicialResuelta) {
    return;
  }

  colaSesion = colaSesion
    .then(() => aplicarSesion(session))
    .catch((error) => {
      console.error('Error al aplicar el estado de sesión:', error);
      ocultarBoot();
    });
}

async function bootstrap() {
  iniciarFormulariosAuth();
  iniciarRouter();

  const btnLogout = $('btn-logout');
  btnLogout?.addEventListener('click', async () => {
    if (btnLogout.disabled) return;
    const textoOriginal = btnLogout.textContent;
    btnLogout.disabled = true;
    btnLogout.setAttribute('aria-busy', 'true');
    btnLogout.textContent = 'Saliendo…';
    try {
      await cerrarSesion();
    } catch (error) {
      console.error('No se pudo cerrar la sesión:', error.message);
    } finally {
      btnLogout.disabled = false;
      btnLogout.removeAttribute('aria-busy');
      btnLogout.textContent = textoOriginal;
    }
  });

  try {
    const session = await obtenerSesionInicial();
    inicialResuelta = true;
    await aplicarSesion(session);
  } catch (error) {
    console.error('No se pudo obtener la sesión inicial:', error);
    inicialResuelta = true;
    await aplicarSesion(null);
  }

  escucharCambiosAuth((evento, session) => {
    procesarCambioSesion(evento, session);
  });
}

void bootstrap();
