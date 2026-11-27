import { useMemo } from 'react';

const TARJETAS = [
  { id: 'n-total', texto: 'Parcelas', color: 'text-marino' },
  { id: 'n-verde', texto: 'En verde', color: 'text-verde-osc' },
  { id: 'n-amarillo', texto: 'En amarillo', color: 'text-amarillo-osc' },
  { id: 'n-rojo', texto: 'En rojo', color: 'text-rojo-osc' },
  { id: 'n-alertas', texto: 'Alertas activas', color: 'text-rojo-osc' },
];

export function Resumen({ parcelas, numeroAlertas }) {
  const conteos = useMemo(() => {
    const totales = { verde: 0, amarillo: 0, rojo: 0 };
    for (const parcela of parcelas) {
      if (totales[parcela.estado] !== undefined) totales[parcela.estado] += 1;
    }
    return {
      'n-total': parcelas.length,
      'n-verde': totales.verde,
      'n-amarillo': totales.amarillo,
      'n-rojo': totales.rojo,
      'n-alertas': numeroAlertas,
    };
  }, [parcelas, numeroAlertas]);

  return (
    <dl className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {TARJETAS.map(({ id, texto, color }, indice) => {
        const esUltima = indice === TARJETAS.length - 1;
        return (
          <div
            key={id}
            className={`rounded-xl border border-borde bg-white px-4 py-4 ${esUltima ? 'col-span-2 sm:col-span-1' : ''}`}
          >
            <dt className="text-sm text-tinta-suave">{texto}</dt>
            <dd id={id} className={`m-0 mt-1 text-2xl font-bold tracking-tight ${color}`}>{conteos[id]}</dd>
          </div>
        );
      })}
    </dl>
  );
}
