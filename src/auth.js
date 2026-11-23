import { supabase } from './supabaseClient.js';

const $ = (id) => document.getElementById(id);

let mensaje;
let vistaLogin;
let vistaRegistro;

function avisar(texto, esError = false) {
  if (!mensaje) return;
  mensaje.textContent = texto;
  mensaje.classList.toggle('error', esError);
}

function limpiarAviso() {
  avisar('');
}

const DOMINIOS_NO_VALIDOS = new Set([
  'ejemplo.com', 'ejemplo.es', 'example.com', 'example.org',
  'test.com', 'prueba.com', 'dominio.com', 'foo.com',
]);
const TERMINACIONES_NO_VALIDAS = /(^|\.)(test|invalid|example|localhost|local|internal)$/i;

function errorCorreo(correo) {
  const valor = correo.trim();
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(valor)) {
    return 'Escribe un correo electrónico válido.';
  }
  const dominio = valor.split('@')[1].toLowerCase();
  if (DOMINIOS_NO_VALIDOS.has(dominio) || TERMINACIONES_NO_VALIDAS.test(dominio)) {
    return 'Usa un correo con un dominio real (por ejemplo, @gmail.com).';
  }
  return null;
}

export function mensajeErrorAuth(error) {
  const codigo = String(error?.code ?? '').toLowerCase();
  const texto = String(error?.message ?? '').toLowerCase();
  const status = Number(error?.status ?? 0);

  if (codigo === 'invalid_credentials' || texto.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.';
  }
  if (codigo === 'email_not_confirmed' || texto.includes('email not confirmed')) {
    return 'Debes confirmar tu correo antes de iniciar sesión.';
  }
  if (codigo === 'user_already_exists' || texto.includes('user already registered')) {
    return 'Ya existe una cuenta con ese correo. Inicia sesión.';
  }
  if (codigo === 'weak_password' || texto.includes('password should be at least 6 characters')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (codigo === 'email_address_invalid' || /email address .* is invalid/i.test(error?.message ?? '')) {
    return 'Ese correo no es válido. Usa una dirección con un dominio real.';
  }
  if (codigo === 'over_email_send_rate_limit' || texto.includes('email rate limit')) {
    return 'Se alcanzó el límite de correos. Espera un minuto antes de volver a intentarlo.';
  }
  if (codigo === 'over_request_rate_limit' || texto.includes('request rate limit') || status === 429) {
    return 'Demasiados intentos seguidos. Espera un minuto antes de volver a intentarlo.';
  }
  if (codigo === 'signup_disabled' || texto.includes('signup is disabled')) {
    return 'El registro está desactivado en este proyecto.';
  }
  if (codigo === 'invalid_grant') {
    return 'No se pudo completar el inicio de sesión. Inténtalo de nuevo.';
  }
  if (texto.includes('failed to fetch') || texto.includes('network') || texto.includes('fetch')) {
    return 'No se pudo conectar con el servicio de autenticación. Comprueba tu conexión.';
  }
  if (texto.includes('popup closed') || texto.includes('provider is not enabled')) {
    return 'No se pudo iniciar sesión con Google. Comprueba la configuración del proveedor.';
  }

  return error?.message || 'No se pudo completar la acción. Inténtalo de nuevo.';
}

function esErrorDeEspera(error) {
  const codigo = String(error?.code ?? '').toLowerCase();
  const texto = String(error?.message ?? '').toLowerCase();
  return codigo === 'over_email_send_rate_limit'
    || codigo === 'over_request_rate_limit'
    || texto.includes('rate limit')
    || Number(error?.status) === 429;
}

async function conEstadoBoton(boton, textoCarga, accion) {
  if (!boton || boton.disabled || boton.dataset.cargando === 'true') return;
  const textoOriginal = boton.textContent;
  boton.dataset.cargando = 'true';
  boton.disabled = true;
  boton.setAttribute('aria-busy', 'true');
  boton.textContent = textoCarga;
  try {
    await accion();
    boton.textContent = textoOriginal;
  } catch (error) {
    avisar(mensajeErrorAuth(error), true);
    if (esErrorDeEspera(error)) {
      let restante = 60;
      boton.textContent = `Reintentar en ${restante}s`;
      const temporizador = setInterval(() => {
        restante -= 1;
        if (restante <= 0) {
          clearInterval(temporizador);
          boton.textContent = textoOriginal;
          boton.disabled = false;
          boton.removeAttribute('aria-busy');
          boton.dataset.cargando = 'false';
        } else {
          boton.textContent = `Reintentar en ${restante}s`;
        }
      }, 1000);
      return;
    }
    boton.textContent = textoOriginal;
  } finally {
    if (!esErrorDeEspera(error) || boton.dataset.cargando !== 'true') {
      // si hubo rate limit, el temporizador gestiona el estado
    }
    if (!esErrorDeEspera(error)) {
      boton.disabled = false;
      boton.removeAttribute('aria-busy');
      boton.dataset.cargando = 'false';
    }
  }
}

export async function obtenerSesionInicial() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session ?? null;
}

export function escucharCambiosAuth(callback) {
  const { data } = supabase.auth.onAuthStateChange((evento, session) => {
    callback(evento, session ?? null);
  });
  return data.subscription;
}

export async function registrarUsuario({ nombre, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre } },
  });
  if (error) throw error;
  return data;
}

// Alias de compatibilidad.
export const registrar = registrarUsuario;

export async function iniciarSesion({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function iniciarSesionConGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function obtenerNombre(user) {
  if (!user) return 'Agricultor';

  const { data, error } = await supabase
    .from('profiles')
    .select('nombre')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;
  const nombrePerfil = data?.nombre?.trim();
  if (nombrePerfil) return nombrePerfil;

  const meta = user.user_metadata ?? {};
  const nombreMeta = String(meta.nombre ?? meta.full_name ?? meta.name ?? '').trim();
  if (nombreMeta) return nombreMeta;

  return user.email?.split('@')[0] || 'Agricultor';
}

export function mostrarFormularioAuth(cual, { foco = false } = {}) {
  const esRegistro = cual === 'registro';
  if (vistaLogin) vistaLogin.hidden = esRegistro;
  if (vistaRegistro) vistaRegistro.hidden = !esRegistro;

  const activo = $('auth-cambiar');
  const inactivo = $('auth-volver');
  const tabActiva = esRegistro ? activo : inactivo;
  const tabInactiva = esRegistro ? inactivo : activo;
  for (const [tab, seleccionado] of [[tabActiva, true], [tabInactiva, false]]) {
    if (!tab) continue;
    tab.setAttribute('aria-selected', String(seleccionado));
    tab.tabIndex = seleccionado ? 0 : -1;
    tab.classList.toggle('border-esmeralda', seleccionado);
    tab.classList.toggle('text-esmeralda-osc', seleccionado);
    tab.classList.toggle('border-transparent', !seleccionado);
    tab.classList.toggle('text-tinta-suave', !seleccionado);
  }
  limpiarAviso();
  if (foco) tabActiva?.focus();
}

function configurarTogglePassword(botonId, inputId) {
  const boton = $(botonId);
  const input = $(inputId);
  if (!boton || !input) return;
  boton.addEventListener('click', () => {
    const visible = input.type === 'text';
    input.type = visible ? 'password' : 'text';
    boton.setAttribute('aria-pressed', String(!visible));
    boton.setAttribute('aria-label', visible ? 'Mostrar contraseña' : 'Ocultar contraseña');
    boton.textContent = visible ? 'Mostrar' : 'Ocultar';
    input.focus({ preventScroll: true });
  });
}

async function enviarFormulario(form, boton, textoCarga, accion) {
  if (!form || form.dataset.enviando === 'true') return;
  if (boton?.disabled) return;

  form.dataset.enviando = 'true';
  limpiarAviso();
  try {
    await conEstadoBoton(boton, textoCarga, accion);
  } finally {
    form.dataset.enviando = 'false';
  }
}

export function iniciarFormulariosAuth() {
  mensaje = $('auth-mensaje');
  vistaLogin = $('login');
  vistaRegistro = $('registro');

  configurarTogglePassword('toggle-login-password', 'login-password');
  configurarTogglePassword('toggle-registro-password', 'registro-password');

  const pestanas = [$('auth-volver'), $('auth-cambiar')].filter(Boolean);
  if (pestanas[0]) pestanas[0].addEventListener('click', () => mostrarFormularioAuth('login', { foco: true }));
  if (pestanas[1]) pestanas[1].addEventListener('click', () => mostrarFormularioAuth('registro', { foco: true }));

  for (const [indice, tab] of pestanas.entries()) {
    tab.addEventListener('keydown', (evento) => {
      let siguiente = null;
      if (evento.key === 'ArrowRight') siguiente = (indice + 1) % pestanas.length;
      else if (evento.key === 'ArrowLeft') siguiente = (indice - 1 + pestanas.length) % pestanas.length;
      else if (evento.key === 'Home') siguiente = 0;
      else if (evento.key === 'End') siguiente = pestanas.length - 1;
      if (siguiente === null) return;
      evento.preventDefault();
      mostrarFormularioAuth(siguiente === 0 ? 'login' : 'registro', { foco: true });
    });
  }

  const formLogin = $('form-login');
  formLogin?.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (!formLogin.reportValidity()) return;

    const email = $('login-email').value.trim();
    const problema = errorCorreo(email);
    if (problema) {
      avisar(problema, true);
      $('login-email').focus();
      return;
    }

    void enviarFormulario(formLogin, formLogin.querySelector('button[type="submit"]'), 'Entrando…', async () => {
      await iniciarSesion({ email, password: $('login-password').value });
      // onAuthStateChange/SIGNED_IN se encarga del panel.
    });
  });

  const formRegistro = $('form-registro');
  formRegistro?.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (!formRegistro.reportValidity()) return;

    const nombre = $('registro-nombre').value.trim();
    const email = $('registro-email').value.trim();
    const password = $('registro-password').value;
    const problema = errorCorreo(email);
    if (!nombre) {
      avisar('Indica tu nombre para crear la cuenta.', true);
      $('registro-nombre').focus();
      return;
    }
    if (problema) {
      avisar(problema, true);
      $('registro-email').focus();
      return;
    }
    if (password.length < 6) {
      avisar('La contraseña debe tener al menos 6 caracteres.', true);
      $('registro-password').focus();
      return;
    }

    void enviarFormulario(formRegistro, formRegistro.querySelector('button[type="submit"]'), 'Creando cuenta…', async () => {
      const data = await registrarUsuario({ nombre, email, password });
      if (data.session) {
        avisar('Cuenta creada. Entrando al panel…');
        return;
      }
      // Si el proyecto tiene confirmación de email activa, no hay sesión.
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        avisar('Ya existe una cuenta con ese correo. Inicia sesión.', true);
        return;
      }
      avisar('Cuenta creada. Revisa tu correo para confirmarla antes de entrar.');
    });
  });

  const btnGoogle = $('btn-google');
  btnGoogle?.addEventListener('click', () => {
    limpiarAviso();
    void conEstadoBoton(btnGoogle, 'Conectando con Google…', async () => {
      await iniciarSesionConGoogle();
      // Redirección externa; si no ocurre, el estado se restaura.
    });
  });

  mostrarFormularioAuth('login');
}
