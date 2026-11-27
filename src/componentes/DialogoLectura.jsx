import { useCallback, useEffect, useRef, useState } from 'react';
import { exportarLecturas } from '../datos/csv.js';
import { cargarHistorial, guardarLectura } from '../datos/lecturas.js';
import { GraficoHumedad } from './GraficoHumedad.jsx';

const formatoNumero = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });

function ahoraLocal() {
  const ahora = new Date();
  return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000)
    .toISOString().slice(0, 16);
}

export function DialogoLectura({ parcela, modo, onCerrar, onCambio }) {
  const dialogoRef = useRef(null);
  const formRef = useRef(null);
  const humedadRef = useRef(null);
  const vivoRef = useRef(true);

  const [humedad, setHumedad] = useState('');
  const [ph, setPh] = useState('');
  const [fecha, setFecha] = useState('');
  const [lecturas, setLecturas] = useState([]);
  const [mensaje, setMensaje] = useState({ texto: '', esError: false });
  const [mensajeHistorial, setMensajeHistorial] = useState({ texto: '', esError: false });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => () => { vivoRef.current = false; }, []);

  const cargar = useCallback(async () => {
    if (vivoRef.current) setMensajeHistorial({ texto: '', esError: false });
    try {
      const datos = await cargarHistorial(parcela.id);
      if (vivoRef.current) setLecturas(datos);
    } catch (error) {
      if (vivoRef.current) setMensajeHistorial({ texto: error.message, esError: true });
    }
  }, [parcela.id]);

  // Montar el diálogo con la parcela ya cargada equivale a la apertura legacy.
  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (!dialogo) return;
    if (!dialogo.open) dialogo.showModal();

    setHumedad(parcela.humedad_suelo == null ? '' : String(parcela.humedad_suelo));
    setPh('');
    setFecha(ahoraLocal());
    setLecturas([]);
    setMensaje({ texto: '', esError: false });

    void (async () => {
      await cargar();
      if (modo === 'medir' && vivoRef.current) humedadRef.current?.focus({ preventScroll: true });
    })();
  }, [parcela.id, modo, cargar]);

  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (!dialogo) return;
    const alCerrar = () => onCerrar();
    dialogo.addEventListener('close', alCerrar);
    return () => dialogo.removeEventListener('close', alCerrar);
  }, [onCerrar]);

  async function guardar(evento) {
    evento.preventDefault();
    if (!formRef.current?.reportValidity() || guardando) return;

    setGuardando(true);
    setMensaje({ texto: 'Guardando lectura…', esError: false });
    try {
      const medidoEn = fecha ? new Date(fecha).toISOString() : new Date().toISOString();
      const evaluacion = await guardarLectura(parcela, {
        humedad: Number(humedad),
        ph: ph.trim() === '' ? null : Number(ph.trim()),
        medidoEn,
      });

      setMensaje({ texto: `Lectura guardada. ${evaluacion.mensaje}.`, esError: false });
      await cargar();
      await onCambio();
      setHumedad(String(Number(humedad)));
      setPh('');
      setFecha(ahoraLocal());
    } catch (error) {
      setMensaje({ texto: error.message, esError: true });
      // Puede haberse guardado la lectura pero fallado el update: sincronizar UI.
      await onCambio().catch(() => {});
    } finally {
      if (vivoRef.current) setGuardando(false);
    }
  }

  const valores = lecturas.map((lectura) => Number(lectura.humedad_suelo));
  const textoStats = lecturas.length === 0
    ? 'Sin lecturas registradas.'
    : `${lecturas.length} lectura${lecturas.length === 1 ? '' : 's'} · `
      + `última ${formatoNumero.format(valores.at(-1))} % · `
      + `mín ${formatoNumero.format(Math.min(...valores))} % · `
      + `máx ${formatoNumero.format(Math.max(...valores))} %`;

  return (
    <dialog ref={dialogoRef} id="dialog-lectura" className="dialogo-lectura" aria-labelledby="lectura-titulo">
      <div className="dialogo-cabecera">
        <div className="min-w-0">
          <p className="m-0 text-xs font-semibold uppercase tracking-wide text-tinta-suave">Parcela</p>
          <h2 id="lectura-titulo" className="truncate">Medir {parcela.nombre}</h2>
        </div>
        <button
          type="button"
          id="btn-cerrar-lectura"
          className="btn secundario pequeno shrink-0"
          aria-label="Cerrar ventana"
          onClick={() => dialogoRef.current?.close()}
        >
          Cerrar
        </button>
      </div>

      <form id="form-lectura" ref={formRef} noValidate onSubmit={guardar}>
        <div className="fila">
          <div>
            <label htmlFor="lectura-humedad">Humedad del suelo (%)</label>
            <input
              id="lectura-humedad"
              ref={humedadRef}
              type="number"
              min="0"
              max="100"
              step="0.1"
              required
              value={humedad}
              onChange={(evento) => setHumedad(evento.target.value)}
            />
          </div>
          <div>
            <label htmlFor="lectura-ph">pH (opcional)</label>
            <input
              id="lectura-ph"
              type="number"
              min="0"
              max="14"
              step="0.1"
              value={ph}
              onChange={(evento) => setPh(evento.target.value)}
            />
          </div>
        </div>

        <label htmlFor="lectura-fecha">Fecha y hora de la medición</label>
        <input
          id="lectura-fecha"
          type="datetime-local"
          value={fecha}
          onChange={(evento) => setFecha(evento.target.value)}
        />

        <p
          id="lectura-mensaje"
          className={`mensaje${mensaje.esError ? ' error' : ''}`}
          role="status"
          aria-live="polite"
        >
          {mensaje.texto}
        </p>

        <div className="acciones mt-4">
          <button
            type="submit"
            id="btn-guardar-lectura"
            className="btn primario w-full sm:w-auto"
            disabled={guardando}
            aria-busy={guardando || undefined}
          >
            Guardar lectura
          </button>
          <button
            type="button"
            id="btn-exportar-csv"
            className="btn secundario w-full sm:w-auto"
            onClick={() => exportarLecturas(parcela, lecturas)}
          >
            Exportar CSV de esta parcela
          </button>
        </div>
      </form>

      <div className="historial">
        <h3>Historial de humedad</h3>
        <p id="lectura-stats" className="ayuda">{textoStats}</p>
        <div className="grafico-caja">
          <GraficoHumedad lecturas={lecturas} />
        </div>
        <p id="grafico-vacio" className="vacio" hidden={lecturas.length > 0}>
          Aún no hay lecturas. Registra la primera para ver la evolución.
        </p>
        <p
          id="historial-mensaje"
          className={`mensaje${mensajeHistorial.esError ? ' error' : ''}`}
          role="status"
          aria-live="polite"
        >
          {mensajeHistorial.texto}
        </p>
      </div>
    </dialog>
  );
}
