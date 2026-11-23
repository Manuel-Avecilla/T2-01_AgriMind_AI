import { mostrarFormularioAuth } from './auth.js';

const VISTAS = new Map([
  ['inicio', { id: 'inicio', titulo: 'AgriMind AI · Agricultura de precisión', etiqueta: 'Inicio', tituloId: 'inicio-titulo' }],
  ['acceso', { id: 'auth', titulo: 'AgriMind AI · Acceso', etiqueta: 'Acceso', tituloId: 'auth-titulo' }],
  ['panel', { id: 'app', titulo: 'AgriMind AI · Panel', etiqueta: 'Panel', tituloId: 'panel-titulo' }],
]);

let conSesion = false;
let sesionConocida = false;

function leerRuta() {
  const crudo = window.location.hash.replace(/^#\/?/, '');
  const [nombre, consulta = ''] = crudo.split('?');
  return {
    nombre: VISTAS.has(nombre) ? nombre : 'inicio',
    parametros: new URLSearchParams(consulta),
  };
}

function irA(nombre) {
  const destino = `#/${nombre}`;
  if (window.location.hash !== destino) {
    history.replaceState(null, '', destino);
  }
}

function ocultarTodasLasVistas() {
  for (const vista of VISTAS.values()) {
    const nodo = document.getElementById(vista.id);
    if (nodo) nodo.hidden = true;
  }
}

export function render(session, { foco = false, conocido = true } = {}) {
  sesionConocida = conocido;
  conSesion = Boolean(session);

  const ruta = leerRuta();

  // Mientras la sesión no se conoce, no se muestra ninguna vista protegida ni
  // formularios: se mantiene el boot para evitar parpadeos y fugas de UI.
  if (!sesionConocida) {
    ocultarTodasLasVistas();
    for (const enlace of document.querySelectorAll('[data-nav]')) {
      const tipo = enlace.dataset.nav;
      enlace.hidden = tipo === 'app' || tipo === 'auth';
    }
    return;
  }

  if (ruta.nombre === 'panel' && !conSesion) {
    irA('acceso');
    ruta.nombre = 'acceso';
    ruta.parametros = new URLSearchParams();
  } else if (ruta.nombre === 'acceso' && conSesion) {
    irA('panel');
    ruta.nombre = 'panel';
    ruta.parametros = new URLSearchParams();
  }

  for (const [clave, vista] of VISTAS) {
    const nodo = document.getElementById(vista.id);
    if (nodo) nodo.hidden = clave !== ruta.nombre;
  }

  for (const enlace of document.querySelectorAll('[data-nav]')) {
    const tipo = enlace.dataset.nav;
    enlace.hidden = (tipo === 'app' && !conSesion) || (tipo === 'auth' && conSesion);
  }

  for (const enlace of document.querySelectorAll('nav a[href^="#/"]')) {
    if (enlace.getAttribute('href') === `#/${ruta.nombre}`) {
      enlace.setAttribute('aria-current', 'page');
    } else {
      enlace.removeAttribute('aria-current');
    }
  }

  const vista = VISTAS.get(ruta.nombre);
  document.title = vista.titulo;

  if (ruta.nombre === 'acceso') {
    mostrarFormularioAuth(ruta.parametros.get('tab') === 'registro' ? 'registro' : 'login');
  }

  const anuncio = document.getElementById('vista-anuncio');
  if (anuncio) anuncio.textContent = `Vista ${vista.etiqueta}`;

  if (foco) {
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.getElementById(vista.tituloId)?.focus({ preventScroll: true });
  }
}

export function iniciarRouter() {
  window.addEventListener('hashchange', () => render(conSesion, { foco: true, conocido: sesionConocida }));
  if (sesionConocida) {
    render(conSesion, { conocido: true });
  }
}
