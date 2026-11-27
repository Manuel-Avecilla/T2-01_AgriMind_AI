# Fase 2 · Vista de acceso

**Objetivo:** migrar el formulario de login/registro a React manteniendo mensajes, validaciones y accesibilidad.

## Qué se hace

- Crear `src/componentes/Acceso.jsx` con las pestañas «Iniciar sesión» / «Crear cuenta», el botón de Google, los dos formularios y el área de mensajes.
- Crear `src/datos/auth.js` con las funciones sin DOM: sesión inicial, login con correo, registro, OAuth de Google, cierre de sesión, lectura del nombre y traducción de errores de Supabase.
- Sustituir la manipulación de `hidden`, clases y atributos por estado de React y JSX condicional.

## Comportamiento que debe quedar igual

- El parámetro `?tab=registro` abre directamente la pestaña de registro.
- Las pestañas responden a clic y a flechas izquierda/derecha, `Home` y `End`, con `aria-selected` y `tabindex` correctos.
- El botón «Mostrar»/«Ocultar» cambia el tipo del campo y actualiza `aria-pressed` y `aria-label`.
- Se conserva la validación de correo, incluida la lista de dominios de ejemplo no válidos.
- Los mensajes de error siguen siendo los mismos: credenciales, correo sin confirmar, cuenta existente, contraseña débil, correo inválido, límites de envío y errores de red.
- Cuando Supabase devuelve un rate limit, el botón muestra una cuenta atrás de 60 segundos antes de permitir el reintento.
- El registro con confirmación por correo muestra el aviso correspondiente; si hay sesión, el listener de `useSesion` se encarga de entrar al panel. No se duplica la lógica de sesión.

## Cómo verificarlo

- Iniciar sesión con un usuario válido y comprobar que se entra al panel.
- Registrar un usuario nuevo y revisar ambos caminos: con sesión inmediata y con confirmación pendiente.
- Probar errores deliberados (contraseña incorrecta, correo de dominio falso) y ver el mismo texto que antes.
- Navegar las pestañas solo con el teclado y verificar el foco.

**Anterior:** [Fase 1 · Base React](./fase-1-base-react.md) · **Siguiente:** [Fase 3 · Panel, parcelas y alertas](./fase-3-panel-parcelas-alertas.md).
