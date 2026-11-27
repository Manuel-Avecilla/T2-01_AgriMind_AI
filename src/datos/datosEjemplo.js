// Datos rescatados de db/init.sql (eliminado al migrar a Supabase).
// Latitud y longitud son valores orientativos para la demostración; se pueden
// ajustar cuando se conozcan las coordenadas reales de las parcelas.
export const parcelasEjemplo = [
  {
    nombre: 'Parcela 1',
    cultivo: 'Olivar',
    superficie_ha: 6.5,
    latitud: 37.7694,
    longitud: -3.7904,
    humedad_suelo: 41.0,
    estado: 'verde',
    notas: 'Riego programado con normalidad.',
  },
  {
    nombre: 'Parcela 2',
    cultivo: 'Girasol',
    superficie_ha: 3.2,
    latitud: 37.3891,
    longitud: -5.9845,
    humedad_suelo: 27.5,
    estado: 'amarillo',
    notas: 'Humedad en descenso, vigilar esta semana.',
  },
  {
    nombre: 'Parcela 3',
    cultivo: 'Trigo',
    superficie_ha: 8.0,
    latitud: 41.6523,
    longitud: -4.7245,
    humedad_suelo: 14.0,
    estado: 'rojo',
    notas: 'Estrés hídrico: regar cuanto antes.',
  },
];

const MS_POR_DIA = 24 * 60 * 60 * 1000;

// Once valores previos + la humedad actual de la parcela = 12 lecturas.
// La última coincide con parcelas.humedad_suelo para que tabla y gráfica cuadren.
const SERIES_BASE = {
  'Parcela 1': [38, 39.5, 37.8, 40.2, 42.4, 44.1, 43.3, 41.6, 39.8, 40.9, 42.7],
  'Parcela 2': [34, 32.6, 31.4, 30.1, 30.6, 29.2, 28.4, 27.1, 26.5, 28, 26.2],
  'Parcela 3': [22, 20.8, 19.6, 18.9, 17.7, 16.5, 15.8, 16.9, 15.2, 14.6, 13.7],
};

/** Devuelve una serie diaria por parcela, ordenada de antigua a reciente. */
export function generarLecturasEjemplo(parcelas) {
  const ahora = Date.now();
  return parcelas.flatMap((parcela) => {
    const base = SERIES_BASE[parcela.nombre] ?? SERIES_BASE['Parcela 1'];
    const valores = [...base, Number(parcela.humedad_suelo)];
    const total = valores.length;

    return valores.map((humedad, indice) => ({
      parcela_id: parcela.id,
      humedad_suelo: humedad,
      ph: Number((6.1 + (indice % 5) * 0.2).toFixed(1)),
      medido_en: new Date(ahora - (total - 1 - indice) * MS_POR_DIA).toISOString(),
    }));
  });
}
