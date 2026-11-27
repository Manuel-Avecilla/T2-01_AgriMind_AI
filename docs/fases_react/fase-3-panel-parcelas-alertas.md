# Fase 3 · Panel, parcelas y alertas

**Objetivo:** migrar el panel principal y el CRUD de parcelas, junto con el resumen y las alertas activas.

## Qué se hace

- Crear `Panel.jsx`, `Resumen.jsx`, `AlertasActivas.jsx`, `FormularioParcela.jsx` y `ListaParcelas.jsx`.
- Crear el hook `usePanel`, que carga parcelas y alertas en paralelo y expone una función de recarga para usarla después de cada cambio.
- Pasar las consultas y mutaciones a `src/datos/parcelas.js` y `src/datos/alertas.js`, y el CSV a `src/datos/csv.js`. Los ejemplos viven en `src/datos/datosEjemplo.js`.
- Los formularios pasan a ser controlados; el desplegable «Estado (calculado)» se deriva de la humedad con `evaluarParcela`.

## Comportamiento que debe quedar igual

- Los cinco contadores del resumen y el número de alertas se calculan a partir de los datos cargados, sin estado duplicado.
- Alta, edición, cancelación y borrado con `confirm`; al borrar la parcela que se estaba editando, el formulario vuelve a «Añadir parcela».
- El botón de ejemplos sigue pidiendo confirmación e inserta las tres parcelas desde el módulo de datos, nunca desde SQL.
- La tabla mantiene insignias de estado, la fila resaltada durante la edición y las etiquetas `data-label` para la vista móvil.
- «Exportar CSV» conserva BOM, separador `;` y comillas dobles para Excel en español.
- Las alertas se resuelven o descartan con los mismos botones y mensajes; el estado vacío aparece cuando no hay activas.
- No se tocan los umbrales del semáforo, `sincronizarAlerta` ni el envío de `user_id` (lo rellena `auth.uid()`).

## Cómo verificarlo

- Crear, editar y borrar una parcela; recargar y comprobar que los datos persisten.
- Cargar los ejemplos y confirmar que aparecen los tres estados del semáforo.
- Exportar el CSV y abrirlo con Excel para comprobar el formato.
- Resolver y descartar alertas, verificando que los contadores bajan.

**Anterior:** [Fase 2 · Acceso](./fase-2-acceso.md) · **Siguiente:** [Fase 4 · Lecturas, gráfica y CSV](./fase-4-lecturas-grafico-csv.md).
