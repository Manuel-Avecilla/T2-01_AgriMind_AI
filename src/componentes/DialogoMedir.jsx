import { useEffect, useRef, useState } from 'react';
import { guardarLectura } from '../datos/lecturas.js';
import { Dialogo } from './Dialogo.jsx';

function ahoraLocal() {
  const ahora = new Date();
  return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000)
    .toISOString().slice(0, 16);
}

/** Modal estrecho: solo registrar una lectura. Se cierra tras guardar. */
export function DialogoMedir({ parcela, onCerrar, onCambio }) {
  const formRef = useRef(null);
  const humedadRef = useRef(null);

  const [humedad, setHumedad] = useState('');
  const [ph, setPh] = useState('');
  const [fecha, setFecha] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', esError: false });
  const [guardando, setGuardando] = useState(false);

  // Solo se reinicia al cambiar de parcela: recargar el panel no debe borrar
  // lo que el usuario está escribiendo.
  useEffect(() => {
    setHumedad(parcela.humedad_suelo == null ? '' : String(parcela.humedad_suelo));
    setPh('');
    setFecha(ahoraLocal());
    setMensaje({ texto: '', esError: false });
  }, [parcela.id]);

  useEffect(() => {
    humedadRef.current?.focus({ preventScroll: true });
  }, [parcela.id]);

  async function guardar(evento) {
    evento.preventDefault();
    if (!formRef.current?.reportValidity() || guardando) return;

    setGuardando(true);
    setMensaje({ texto: 'Guardando lectura…', esError: false });
    try {
      const medidoEn = fecha ? new Date(fecha).toISOString() : new Date().toISOString();
      await guardarLectura(parcela, {
        humedad: Number(humedad),
        ph: ph.trim() === '' ? null : Number(ph.trim()),
        medidoEn,
      });

      await onCambio();
      setGuardando(false);
      onCerrar();
    } catch (error) {
      setMensaje({ texto: error.message, esError: true });
      setGuardando(false);
      // Puede haberse guardado la lectura pero fallado el update: sincronizar UI.
      await onCambio().catch(() => {});
    }
  }

  return (
    <Dialogo
      id="dialog-lectura"
      tituloId="lectura-titulo"
      titulo={`Medir ${parcela.nombre}`}
      cerrarId="btn-cerrar-lectura"
      className="dialogo-medir"
      onCerrar={onCerrar}
    >
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
            {guardando ? 'Guardando…' : 'Guardar lectura'}
          </button>
        </div>
      </form>
    </Dialogo>
  );
}
