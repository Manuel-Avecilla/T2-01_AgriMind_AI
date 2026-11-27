export const ENLACES = [
  { nav: 'inicio', ruta: 'inicio', texto: 'Inicio' },
  { nav: 'app', ruta: 'panel', texto: 'Panel' },
  { nav: 'auth', ruta: 'acceso', texto: 'Acceso' },
];

export function hrefDe(ruta) {
  return `#/${ruta}`;
}

export function visibleNav(nav, sesion, sesionConocida) {
  if (!sesionConocida) return nav === 'inicio';
  if (nav === 'app') return Boolean(sesion);
  if (nav === 'auth') return !sesion;
  return true;
}
