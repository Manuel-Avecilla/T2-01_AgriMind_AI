import { mostrarFormularioAuth } from './auth.js';

// SPA ligera: las tres vistas viven en el DOM y solo se alterna `hidden`.
// El estado de sesión lo fija main.js desde onAuthStateChange; aquí solo decide
// qué vista se muestra y protege el panel.
const VISTAS = new Map([
  ['inicio', { id: 'inicio', titulo: 'AgriMind AI · Agricultura de precisión', etiqueta: 'Inicio', tituloId: 'inicio-titulo' }],
  ['acceso', { id: 'auth', titulo: 'AgriMind AI · Acceso', etiqueta: 'Acceso', tituloId: 'auth-titulo' }],
  ['panel', { id: 'app', titulo: 'AgriMind AI · Panel', etiqueta: 'Panel', tituloId: 'panel-titulo' }],
]);

let conSesion = false;

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

export function render(session, { foco = false } = {}) {
  conSesion = Boolean(session);
  const ruta = leerRuta();

  // Guardias de sesión: sin cuenta no se puede ver el panel; con cuenta no
  // tiene sentido volver al formulario de acceso.
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
    document.getElementById(vista.id).hidden = clave !== ruta.nombre;
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
  window.addEventListener('hashchange', () => render(conSesion, { foco: true }));
  render(conSesion);
}
