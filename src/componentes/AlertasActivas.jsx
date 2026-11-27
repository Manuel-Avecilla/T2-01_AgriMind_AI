import { useState } from 'react';
import { descartarAlerta, resolverAlerta } from '../datos/alertas.js';

const ETIQUETAS_NIVEL = { amarillo: 'Amarillo', rojo: 'Rojo' };

function nombreParcela(alerta) {
  const parcela = alerta.parcelas;
  return (Array.isArray(parcela) ? parcela[0]?.nombre : parcela?.nombre) ?? 'Parcela';
}

export function AlertasActivas({ alertas, errorCarga, recargar }) {
  const [aviso, setAviso] = useState({ texto: '', esError: false });
  const [ocupadoId, setOcupadoId] = useState(null);

  const texto = aviso.texto || errorCarga;
  const esError = Boolean(errorCarga) || aviso.esError;

  async function actuar(alerta, accion) {
    if (ocupadoId !== null) return;
    setOcupadoId(alerta.id);
    setAviso({ texto: '', esError: false });
    try {
      if (accion === 'resolver') await resolverAlerta(alerta.id);
      else await descartarAlerta(alerta.id);
      await recargar();
    } catch (error) {
      setAviso({ texto: error.message, esError: true });
    } finally {
      setOcupadoId(null);
    }
  }

  return (
    <section className="panel mb-6" aria-labelledby="titulo-alertas">
      <div className="listado-cabecera">
        <div className="flex items-center gap-3">
          <h2 id="titulo-alertas" className="m-0">Alertas activas</h2>
          <span id="n-alertas-panel" className="conteo" aria-hidden="true">{alertas.length}</span>
        </div>
      </div>
      <p id="alertas-mensaje" className={`mensaje${esError ? ' error' : ''}`} role="status" aria-live="polite">{texto}</p>
      <ul id="lista-alertas" className="m-0 list-none p-0">
        {alertas.map((alerta) => (
          <li key={alerta.id} className={`alerta-item nivel-${alerta.nivel}`}>
            <div className="alerta-cabecera">
              <strong className="text-base">{nombreParcela(alerta)}</strong>
              <span className={`insignia ${alerta.nivel}`}>
                {ETIQUETAS_NIVEL[alerta.nivel] ?? alerta.nivel}
              </span>
            </div>
            <p className="alerta-mensaje">{alerta.mensaje}</p>
            <p className="alerta-causa"><strong>Por qué: </strong>{alerta.causa ?? 'Sin detalle.'}</p>
            <div className="alerta-acciones">
              <button
                type="button"
                className="btn secundario pequeno"
                data-accion="resolver"
                data-id={alerta.id}
                disabled={ocupadoId !== null}
                aria-busy={ocupadoId === alerta.id || undefined}
                onClick={() => actuar(alerta, 'resolver')}
              >
                Resolver
              </button>
              <button
                type="button"
                className="btn peligro pequeno"
                data-accion="descartar"
                data-id={alerta.id}
                disabled={ocupadoId !== null}
                aria-busy={ocupadoId === alerta.id || undefined}
                onClick={() => actuar(alerta, 'descartar')}
              >
                Descartar
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p id="alertas-vacio" className="vacio" hidden={alertas.length > 0}>
        Sin alertas activas. Las lecturas crearán las que hagan falta.
      </p>
    </section>
  );
}
