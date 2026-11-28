import { useEffect, useRef, useState } from 'react';
import { evaluarParcela } from '../datos/alertas.js';
import { actualizarParcela, crearParcela } from '../datos/parcelas.js';

const VACIO = {
  id: '',
  nombre: '',
  cultivo: '',
  superficie: '',
  humedad: '',
  latitud: '',
  longitud: '',
  notas: '',
};

/** Formulario de alta/edición. Se usa dentro de DialogoParcela. */
export function FormularioParcela({ editando, onCerrar, aviso, onAvisar, errorCarga, recargar }) {
  const [campos, setCampos] = useState(VACIO);
  const formRef = useRef(null);
  const nombreRef = useRef(null);

  // Se sincroniza solo al cambiar de parcela: recargar el panel mientras se
  // escribe no debe borrar lo que hay en el formulario.
  useEffect(() => {
    if (!editando) {
      setCampos(VACIO);
    } else {
      setCampos({
        id: editando.id ?? '',
        nombre: editando.nombre ?? '',
        cultivo: editando.cultivo ?? '',
        superficie: editando.superficie_ha == null ? '' : String(editando.superficie_ha),
        humedad: editando.humedad_suelo == null ? '' : String(editando.humedad_suelo),
        latitud: editando.latitud == null ? '' : String(editando.latitud),
        longitud: editando.longitud == null ? '' : String(editando.longitud),
        notas: editando.notas ?? '',
      });
    }
    nombreRef.current?.focus({ preventScroll: true });
  }, [editando?.id]);

  function alCambiar(campo) {
    return (evento) => {
      const valor = evento.target.value;
      setCampos((actual) => ({ ...actual, [campo]: valor }));
    };
  }

  function leerCuerpo() {
    const opcional = (valor) => {
      const texto = String(valor).trim();
      return texto === '' ? null : Number(texto);
    };

    return {
      nombre: campos.nombre.trim(),
      cultivo: campos.cultivo.trim(),
      superficie_ha: Number(campos.superficie),
      humedad_suelo: Number(campos.humedad),
      latitud: opcional(campos.latitud),
      longitud: opcional(campos.longitud),
      estado: evaluarParcela(campos.humedad).estado,
      notas: campos.notas.trim(),
    };
  }

  async function guardar(evento) {
    evento.preventDefault();
    if (!formRef.current?.reportValidity()) return;

    const id = campos.id;
    const cuerpo = leerCuerpo();
    try {
      if (id) await actualizarParcela(id, cuerpo);
      else await crearParcela(cuerpo);
      onAvisar(id ? 'Cambios guardados.' : 'Parcela añadida.');
      await recargar();
      onCerrar();
    } catch (error) {
      onAvisar(error.message, true);
    }
  }

  function cancelar() {
    onAvisar('');
    onCerrar();
  }

  const texto = aviso.texto || errorCarga;
  const esError = Boolean(errorCarga) || aviso.esError;

  return (
    <form id="form" ref={formRef} noValidate onSubmit={guardar}>
      <input type="hidden" id="id" value={campos.id} readOnly />

      <label htmlFor="nombre">Nombre</label>
      <input
        id="nombre"
        ref={nombreRef}
        type="text"
        maxLength={100}
        required
        autoComplete="off"
        value={campos.nombre}
        onChange={alCambiar('nombre')}
      />

      <label htmlFor="cultivo">Cultivo</label>
      <input
        id="cultivo"
        type="text"
        maxLength={100}
        required
        autoComplete="off"
        value={campos.cultivo}
        onChange={alCambiar('cultivo')}
      />

      <div className="fila">
        <div>
          <label htmlFor="superficie">Superficie (ha)</label>
          <input
            id="superficie"
            type="number"
            min="0.01"
            step="0.01"
            required
            value={campos.superficie}
            onChange={alCambiar('superficie')}
          />
        </div>
        <div>
          <label htmlFor="humedad">Humedad del suelo (%)</label>
          <input
            id="humedad"
            type="number"
            min="0"
            max="100"
            step="0.1"
            required
            value={campos.humedad}
            onChange={alCambiar('humedad')}
          />
        </div>
      </div>

      <fieldset className="grupo">
        <legend>Ubicación (opcional)</legend>
        <div className="fila">
          <div>
            <label htmlFor="latitud">Latitud</label>
            <input
              id="latitud"
              type="number"
              min="-90"
              max="90"
              step="any"
              inputMode="decimal"
              placeholder="37.7694"
              value={campos.latitud}
              onChange={alCambiar('latitud')}
            />
          </div>
          <div>
            <label htmlFor="longitud">Longitud</label>
            <input
              id="longitud"
              type="number"
              min="-180"
              max="180"
              step="any"
              inputMode="decimal"
              placeholder="-3.7904"
              value={campos.longitud}
              onChange={alCambiar('longitud')}
            />
          </div>
        </div>
        <p className="ayuda">Usa punto decimal. La ubicación permitirá consultar el tiempo de cada parcela.</p>
      </fieldset>

      <label htmlFor="estado">Estado (calculado)</label>
      <select id="estado" disabled value={evaluarParcela(campos.humedad).estado} onChange={() => {}}>
        <option value="verde">Verde: todo en orden</option>
        <option value="amarillo">Amarillo: vigilar</option>
        <option value="rojo">Rojo: actuar ya</option>
      </select>
      <p className="ayuda">El semáforo se calcula solo con la humedad de cada lectura.</p>

      <label htmlFor="notas">Notas</label>
      <textarea id="notas" rows="3" value={campos.notas} onChange={alCambiar('notas')}></textarea>

      <p id="mensaje" className={`mensaje${esError ? ' error' : ''}`} role="status" aria-live="polite">{texto}</p>

      <div className="acciones mt-3">
        <button type="submit" id="btn-guardar" className="btn primario w-full sm:w-auto">
          {editando ? 'Guardar cambios' : 'Añadir parcela'}
        </button>
        <button type="button" id="btn-cancelar" className="btn secundario w-full sm:w-auto" onClick={cancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
