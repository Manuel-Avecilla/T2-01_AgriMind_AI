# Fase 4 · Lecturas, gráfica y CSV

**Objetivo:** migrar el diálogo de medición e historial sin alterar el flujo de guardado de lecturas ni la gráfica.

## Qué se hace

- Crear `DialogoLectura.jsx` con el formulario de humedad, pH opcional y fecha/hora, los mensajes, las estadísticas y el botón de exportación.
- Crear `GraficoHumedad.jsx`, que encapsula el `<canvas>` y el ciclo de vida de Chart.js mediante una referencia y una limpieza al cerrar.
- Trasladar a `src/datos/lecturas.js` la consulta del historial y el flujo completo de guardado: inserción en `lecturas`, actualización de humedad/estado en `parcelas` y `sincronizarAlerta`.
- Reutilizar `src/datos/csv.js` para la exportación de lecturas de la parcela.

## Comportamiento que debe quedar igual

- Los botones «Medir» e «Historial» abren el mismo diálogo; el primero enfoca el campo de humedad.
- Se cargan como máximo 100 lecturas ordenadas por fecha y se muestran las estadísticas de última, mínima y máxima.
- La gráfica mantiene las franjas de umbral, la escala 0-100 %, los colores por estado del semáforo y el tooltip con el pH.
- Al registrar una lectura se conserva el orden de operaciones y el manejo del error `23505` para actualizar una alerta ya existente.
- Tras guardar se recargan el historial, las parcelas y las alertas; el mensaje final incluye la explicación del semáforo.
- Si falla una parte del flujo, se intenta sincronizar la interfaz y se muestra el error en el diálogo.
- Al cerrar el diálogo se destruye la instancia de Chart.js para no dejar listeners ni canvas huérfanos.

## Cómo verificarlo

- Abrir «Medir», guardar una lectura roja, amarilla y verde y comprobar que cambian el estado de la parcela y las alertas.
- Abrir «Historial» y ver la curva con las franjas de color y las estadísticas actualizadas.
- Exportar el CSV de la parcela y comprobar que conserva el formato de Excel en español.
- Cerrar y reabrir el diálogo varias veces para descartar acumulación de gráficas.

**Anterior:** [Fase 3 · Panel, parcelas y alertas](./fase-3-panel-parcelas-alertas.md) · **Siguiente:** [Fase 5 · Limpieza y verificación final](./fase-5-limpieza-y-verificacion.md).
