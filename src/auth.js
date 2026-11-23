import { supabase } from './supabaseClient.js';

const $ = (id) => document.getElementById(id);

let mensaje;
let vistaLogin;
let vistaRegistro;

function avisar(texto, esError = false) {
  mensaje.textContent = texto;
  mensaje.classList.toggle('error', esError);
}

// Dominios reservados que Supabase rechaza porque no pueden recibir correo.
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

// El trigger on_auth_user_created de supabase/schema.sql lee este nombre desde
// raw_user_meta_data y lo guarda en public.profiles. Solo se usa para mostrarlo:
// las decisiones de acceso se toman con auth.uid(), nunca con metadatos.
export async function registrar({ nombre, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre } },
  });
  if (error) throw error;
  return data;
}

export async function iniciarSesion({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
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
  return data?.nombre?.trim() || user.email?.split('@')[0] || 'Agricultor';
}

function esErrorDeEspera(error) {
  return ['over_email_send_rate_limit', 'over_request_rate_limit'].includes(error?.code)
    || /rate limit/i.test(error?.message ?? '');
}

function mensajeError(error) {
  const codigo = error?.code ?? '';
  const mensaje = error?.message ?? '';

  if (codigo === 'email_address_invalid' || /Email address .* is invalid/i.test(mensaje)) {
    return 'Ese correo no es válido. Usa una dirección con un dominio real.';
  }
  if (codigo === 'over_email_send_rate_limit' || /email rate limit/i.test(mensaje)) {
    return 'Se alcanzó el límite de correos de Supabase. Espera un minuto o entra con una cuenta de prueba.';
  }
  if (codigo === 'over_request_rate_limit' || /request rate limit/i.test(mensaje)) {
    return 'Demasiados intentos seguidos. Espera un minuto antes de volver a intentarlo.';
  }

  switch (mensaje) {
    case 'Invalid login credentials':
      return 'Correo o contraseña incorrectos.';
    case 'User already registered':
      return 'Ya existe una cuenta con ese correo. Inicia sesión.';
    case 'Password should be at least 6 characters':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'Signup is disabled':
      return 'El registro está desactivado en este proyecto.';
    default:
      return mensaje || 'No se pudo completar la acción. Inténtalo de nuevo.';
  }
}

// Pestañas de acceso. El router llama a esta función al entrar en #/acceso.
export function mostrarFormularioAuth(cual, { foco = false } = {}) {
  const esRegistro = cual === 'registro';
  vistaLogin.hidden = esRegistro;
  vistaRegistro.hidden = !esRegistro;

  const activo = esRegistro ? $('auth-cambiar') : $('auth-volver');
  const inactivo = esRegistro ? $('auth-volver') : $('auth-cambiar');
  for (const [tab, seleccionado] of [[activo, true], [inactivo, false]]) {
    tab.setAttribute('aria-selected', String(seleccionado));
    tab.tabIndex = seleccionado ? 0 : -1;
    tab.classList.toggle('border-esmeralda', seleccionado);
    tab.classList.toggle('text-esmeralda-osc', seleccionado);
    tab.classList.toggle('border-transparent', !seleccionado);
    tab.classList.toggle('text-tinta-suave', !seleccionado);
  }
  avisar('');
  if (foco) activo.focus();
}

export function iniciarFormulariosAuth() {
  mensaje = $('auth-mensaje');
  vistaLogin = $('login');
  vistaRegistro = $('registro');

  // Un solo envío a la vez y espera breve tras un error de límite: evita que
  // tres clics seguidos agoten el cupo de correos del plan gratuito.
  async function enviar(form, accion) {
    if (form.dataset.enviando === 'true') return;
    const boton = form.querySelector('button[type="submit"]');
    if (boton.disabled) return;

    const textoOriginal = boton.textContent;
    form.dataset.enviando = 'true';
    boton.disabled = true;
    boton.textContent = 'Un momento…';
    avisar('');

    try {
      await accion();
      boton.textContent = textoOriginal;
      boton.disabled = false;
    } catch (error) {
      avisar(mensajeError(error), true);
      if (esErrorDeEspera(error)) {
        let restante = 60;
        boton.textContent = `Reintentar en ${restante}s`;
        const temporizador = setInterval(() => {
          restante -= 1;
          if (restante <= 0) {
            clearInterval(temporizador);
            boton.textContent = textoOriginal;
            boton.disabled = false;
          } else {
            boton.textContent = `Reintentar en ${restante}s`;
          }
        }, 1000);
      } else {
        boton.textContent = textoOriginal;
        boton.disabled = false;
      }
    } finally {
      form.dataset.enviando = 'false';
    }
  }

  const pestanas = [$('auth-volver'), $('auth-cambiar')];
  pestanas[0].addEventListener('click', () => mostrarFormularioAuth('login', { foco: true }));
  pestanas[1].addEventListener('click', () => mostrarFormularioAuth('registro', { foco: true }));

  for (const [indice, tab] of pestanas.entries()) {
    tab.addEventListener('keydown', (evento) => {
      let siguiente = null;
      if (evento.key === 'ArrowRight') siguiente = (indice + 1) % pestanas.length;
      else if (evento.key === 'ArrowLeft') siguiente = (indice - 1 + pestanas.length) % pestanas.length;
      else if (evento.key === 'Home') siguiente = 0;
      else if (evento.key === 'End') siguiente = pestanas.length - 1;
      if (siguiente === null) return;
      evento.preventDefault();
      const destino = pestanas[siguiente];
      mostrarFormularioAuth(siguiente === 0 ? 'login' : 'registro', { foco: true });
      destino.focus();
    });
  }

  $('form-login').addEventListener('submit', (evento) => {
    evento.preventDefault();
    const form = evento.currentTarget;
    if (!form.reportValidity()) return;

    const email = $('login-email').value.trim();
    const problema = errorCorreo(email);
    if (problema) {
      avisar(problema, true);
      return;
    }

    void enviar(form, () => iniciarSesion({
      email,
      password: $('login-password').value,
    }));
    // onAuthStateChange se encarga de mostrar el panel.
  });

  $('form-registro').addEventListener('submit', (evento) => {
    evento.preventDefault();
    const form = evento.currentTarget;
    if (!form.reportValidity()) return;

    const email = $('registro-email').value.trim();
    const problema = errorCorreo(email);
    if (problema) {
      avisar(problema, true);
      return;
    }

    void enviar(form, async () => {
      const { session } = await registrar({
        nombre: $('registro-nombre').value.trim(),
        email,
        password: $('registro-password').value,
      });
      if (!session) {
        avisar('Cuenta creada. Revisa tu correo para confirmarla antes de entrar.');
      }
      // Con sesión, onAuthStateChange muestra el panel directamente.
    });
  });

  mostrarFormularioAuth('login');
}
