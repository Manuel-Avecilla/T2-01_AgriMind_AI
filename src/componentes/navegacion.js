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

export function claseNav(activo) {
  return `inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold no-underline transition-colors ${
    activo
      ? 'bg-esmeralda-suave text-esmeralda-osc'
      : 'text-marino hover:bg-papel hover:text-marino'
  }`;
}
