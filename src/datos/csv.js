// CSV compatible con Excel en español: BOM, separador ';' y comillas dobles.

import { evaluarParcela } from './alertas.js';

export function nombreArchivo(nombre) {
  return nombre.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'parcela';
}

export function descargarCsv(cabeceras, filas, nombreBase) {
  const escapar = (valor) => `"${String(valor ?? '').replaceAll('"', '""')}"`;
  const contenido = [cabeceras, ...filas]
    .map((fila) => fila.map(escapar).join(';'))
    .join('\r\n');

  const url = URL.createObjectURL(new Blob(['\uFEFF', contenido], { type: 'text/csv;charset=utf-8;' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `${nombreBase}.csv`;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function exportarParcelas(parcelas) {
  descargarCsv(
    ['nombre', 'cultivo', 'superficie_ha', 'latitud', 'longitud', 'humedad_suelo_%', 'estado', 'notas'],
    parcelas.map((parcela) => [
      parcela.nombre,
      parcela.cultivo,
      parcela.superficie_ha,
      parcela.latitud ?? '',
      parcela.longitud ?? '',
      parcela.humedad_suelo ?? '',
      parcela.estado,
      parcela.notas ?? '',
    ]),
    'parcelas'
  );
}

export function exportarLecturas(parcela, lecturas) {
  descargarCsv(
    ['fecha', 'humedad_suelo_%', 'ph', 'estado'],
    lecturas.map((lectura) => [
      lectura.medido_en,
      lectura.humedad_suelo,
      lectura.ph ?? '',
      evaluarParcela(lectura.humedad_suelo).estado,
    ]),
    `lecturas-${nombreArchivo(parcela.nombre)}`
  );
}
