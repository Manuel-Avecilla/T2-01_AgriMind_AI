import { useCallback, useEffect, useRef, useState } from 'react';
import { exportarLecturas } from '../datos/csv.js';
import { cargarHistorial } from '../datos/lecturas.js';
import { Dialogo } from './Dialogo.jsx';
import { GraficoHumedad } from './GraficoHumedad.jsx';

const formatoNumero = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });

/** Modal ancho: solo lecturas, gráfica y exportación. No permite medir. */
export function DialogoHistorial({ parcela, onCerrar }) {
  const vivoRef = useRef(true);
  const [lecturas, setLecturas] = useState([]);
  const [mensaje, setMensaje] = useState({ texto: '', esError: false });

  useEffect(() => () => { vivoRef.current = false; }, []);

  const cargar = useCallback(async () => {
    if (vivoRef.current) setMensaje({ texto: '', esError: false });
    try {
      const datos = await cargarHistorial(parcela.id);
      if (vivoRef.current) setLecturas(datos);
    } catch (error) {
      if (vivoRef.current) setMensaje({ texto: error.message, esError: true });
    }
  }, [parcela.id]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const valores = lecturas.map((lectura) => Number(lectura.humedad_suelo));
  const textoStats = lecturas.length === 0
    ? 'Sin lecturas registradas.'
    : `${lecturas.length} lectura${lecturas.length === 1 ? '' : 's'} · `
      + `última ${formatoNumero.format(valores.at(-1))} % · `
      + `mín ${formatoNumero.format(Math.min(...valores))} % · `
      + `máx ${formatoNumero.format(Math.max(...valores))} %`;

  return (
    <Dialogo
      id="dialog-historial"
      tituloId="historial-titulo"
      titulo={`Historial de ${parcela.nombre}`}
      cerrarId="btn-cerrar-historial"
      className="dialogo-historial"
      onCerrar={onCerrar}
    >
      <div className="historial">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className="m-0 text-base text-marino">Evolución de la humedad</h3>
            <p id="lectura-stats" className="ayuda mt-1">{textoStats}</p>
          </div>
          <button
            type="button"
            id="btn-exportar-csv"
            className="btn secundario pequeno"
            onClick={() => exportarLecturas(parcela, lecturas)}
            disabled={lecturas.length === 0}
          >
            Exportar CSV
          </button>
        </div>

        <div className="grafico-caja">
          <GraficoHumedad lecturas={lecturas} />
        </div>
        <p id="grafico-vacio" className="vacio" hidden={lecturas.length > 0}>
          Aún no hay lecturas. Registra la primera para ver la evolución.
        </p>
        <p
          id="historial-mensaje"
          className={`mensaje${mensaje.esError ? ' error' : ''}`}
          role="status"
          aria-live="polite"
        >
          {mensaje.texto}
        </p>
      </div>
    </Dialogo>
  );
}
