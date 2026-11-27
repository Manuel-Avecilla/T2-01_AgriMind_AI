import { useEffect, useRef } from 'react';
import { evaluarParcela, UMBRALES } from '../datos/alertas.js';

const COLORES_ESTADO = { verde: '#1f9d63', amarillo: '#e0a100', rojo: '#d64545' };
const formatoFecha = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
});

// Las franjas de umbral convierten la curva en el propio semáforo, sin plugin externo.
const bandasUmbral = {
  id: 'bandasUmbral',
  beforeDatasetsDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea || !scales?.y) return;

    const franjas = [
      [0, UMBRALES.critico, 'rgba(214, 69, 69, 0.10)'],
      [UMBRALES.critico, UMBRALES.bajo, 'rgba(224, 161, 0, 0.10)'],
      [UMBRALES.bajo, UMBRALES.alto, 'rgba(31, 157, 99, 0.10)'],
      [UMBRALES.alto, UMBRALES.encharcamiento, 'rgba(224, 161, 0, 0.10)'],
      [UMBRALES.encharcamiento, 100, 'rgba(214, 69, 69, 0.10)'],
    ];

    ctx.save();
    for (const [desde, hasta, color] of franjas) {
      const yArriba = scales.y.getPixelForValue(hasta);
      const yAbajo = scales.y.getPixelForValue(desde);
      ctx.fillStyle = color;
      ctx.fillRect(
        chartArea.left,
        Math.min(yArriba, yAbajo),
        chartArea.right - chartArea.left,
        Math.abs(yAbajo - yArriba)
      );
    }
    ctx.restore();
  },
};

export function GraficoHumedad({ lecturas }) {
  const lienzoRef = useRef(null);
  const graficoRef = useRef(null);

  useEffect(() => {
    const lienzo = lienzoRef.current;
    if (!lienzo) return;

    let vivo = true;
    graficoRef.current?.destroy();
    graficoRef.current = null;
    if (lecturas.length === 0) return undefined;

    // Carga diferida: Chart.js sigue fuera del bundle inicial y una apertura
    // rápida/cierre no puede dejar una instancia creada después del cleanup.
    void (async () => {
      const { Chart } = await import('chart.js/auto');
      if (!vivo || !lienzoRef.current) return;

      graficoRef.current = new Chart(lienzo, {
        type: 'line',
        data: {
          labels: lecturas.map((lectura) => formatoFecha.format(new Date(lectura.medido_en))),
          datasets: [{
            label: 'Humedad del suelo (%)',
            data: lecturas.map((lectura) => Number(lectura.humedad_suelo)),
            borderColor: '#1f9d63',
            backgroundColor: 'rgba(31, 157, 99, 0.12)',
            pointBackgroundColor: lecturas.map(
              (lectura) => COLORES_ESTADO[evaluarParcela(lectura.humedad_suelo).estado]
            ),
            pointBorderColor: '#ffffff',
            pointBorderWidth: 1.5,
            pointRadius: 4,
            tension: 0.25,
            fill: true,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { intersect: false, mode: 'index' },
          scales: {
            y: {
              min: 0,
              max: 100,
              ticks: { callback: (valor) => `${valor} %`, stepSize: 20 },
            },
            x: { ticks: { maxTicksLimit: 6 } },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                afterLabel: (punto) => {
                  const lectura = lecturas[punto.dataIndex];
                  return lectura?.ph != null ? `pH ${lectura.ph}` : '';
                },
              },
            },
          },
        },
        plugins: [bandasUmbral],
      });
    })();

    return () => {
      vivo = false;
      graficoRef.current?.destroy();
      graficoRef.current = null;
    };
  }, [lecturas]);

  return (
    <canvas
      ref={lienzoRef}
      id="grafico-humedad"
      role="img"
      aria-label="Evolución de la humedad del suelo"
    ></canvas>
  );
}
