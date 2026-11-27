# Fase 5 · Limpieza y verificación final

**Objetivo:** retirar los módulos vanilla que ya no se usan y confirmar que la refactorización no cambió la funcionalidad.

## Qué se hace

- Eliminar `src/main.js`, `src/router.js`, `src/auth.js`, `src/parcelas.js`, `src/lecturas.js`, `src/alertas.js` y `src/datosEjemplo.js` una vez sustituidos por sus equivalentes React.
- Buscar referencias residuales a esos archivos y a los antiguos identificadores del DOM (`#tbody`, `#form-login`, `#grafico-humedad`, etc.).
- Confirmar que `src/styles.css`, `supabase/schema.sql`, `opencode.json` y los documentos originales de `docs/` siguen sin cambios.
- Confirmar que no aparecen restos del stack anterior: `server.js`, `Dockerfile`, `docker-compose.yml` ni endpoints `/api/*`.

## Comprobación completa

- `pnpm build` (o `node node_modules/vite/bin/vite.js build` si `pnpm` no está en el PATH).
- `pnpm dev` y revisión manual de las tres rutas y sus redirecciones.
- Autenticación: login, registro, Google, cierre de sesión y mensajes de error.
- Parcelas: alta, edición, borrado, ejemplos y exportación CSV.
- Lecturas: medir, historial, gráfica, CSV y creación/resolución de alertas.
- Vista móvil: tabla convertida en fichas y diálogo legible.
- Revisión de `git diff` para asegurar que solo cambiaron entry, componentes, hooks, módulos de datos y dependencias.

Si se sigue el estilo de trabajo de `AGENTS.md`, cada fase puede cerrarse con su propio commit; esta última incluye el cambio de dependencias y la eliminación de archivos.

**Volver al índice:** [Fase 1 · Base React](./fase-1-base-react.md).
