# Fase 1 · Base React y esqueleto de la aplicación

**Objetivo:** sustituir el arranque de JavaScript vanilla por React sin cambiar todavía ninguna regla de negocio ni ninguna pantalla.

## Qué se hace

- Añadir únicamente `react`, `react-dom` y `@vitejs/plugin-react` con `pnpm`. Se mantiene Vite, el plugin de Tailwind 4, Chart.js 4 y `@supabase/supabase-js` v2.
- Registrar el plugin de React en `vite.config.js`, junto a `tailwindcss()`.
- Reducir `index.html` a un esqueleto con `<div id="root">` y el entry apuntando a `src/main.jsx`. El logotipo deja de vivir como `<symbol>` en el HTML y pasa a un componente `Logo.jsx`.
- Crear `src/App.jsx` y los componentes de estructura: `Cabecera`, `Pie`, `Logo` e `Inicio`.
- Crear los hooks ligeros `useSesion` y `useRuta`.

## Comportamiento que debe quedar igual

- La sesión se resuelve con `getSession()` antes de pintar; mientras no se conozca se muestra el boot y no se filtra ninguna vista protegida.
- Se ignora el `INITIAL_SESSION` posterior del listener y los cambios de sesión se serializan en una cola.
- Las rutas por hash siguen siendo `#/inicio`, `#/acceso`, `#/panel` y `#/acceso?tab=registro`.
- Sin sesión, `#/panel` redirige a acceso; con sesión, acceso redirige a panel.
- Se conservan `document.title`, el foco del título al navegar y el anuncio `aria-live`.
- `src/styles.css` no se toca: Tailwind 4 y los tokens de marca siguen siendo la única fuente de estilos.

## Cómo verificarlo

- `pnpm install` y `pnpm build` terminan sin errores.
- `pnpm dev` muestra la portada, la cabecera y el pie con el mismo aspecto.
- Al entrar a `#/panel` sin sesión se redirige a `#/acceso`; el enlace `Panel` permanece oculto hasta iniciar sesión.

**Siguiente:** [Fase 2 · Acceso](./fase-2-acceso.md).
