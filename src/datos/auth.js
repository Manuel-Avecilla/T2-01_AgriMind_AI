import { supabase } from '../supabaseClient.js';

const DOMINIOS_NO_VALIDOS = new Set([
  'ejemplo.com', 'ejemplo.es', 'example.com', 'example.org',
  'test.com', 'prueba.com', 'dominio.com', 'foo.com',
]);
const TERMINACIONES_NO_VALIDAS = /(^|\.)(test|invalid|example|localhost|local|internal)$/i;

export function errorCorreo(correo) {
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

export function esErrorDeEspera(error) {
  const codigo = String(error?.code ?? '').toLowerCase();
  const texto = String(error?.message ?? '').toLowerCase();
  return codigo === 'over_email_send_rate_limit'
    || codigo === 'over_request_rate_limit'
    || texto.includes('rate limit')
    || Number(error?.status) === 429;
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
