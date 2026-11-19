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
