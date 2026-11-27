import { exportarParcelas } from '../datos/csv.js';

const ETIQUETAS = { verde: 'Verde', amarillo: 'Amarillo', rojo: 'Rojo' };

export function ListaParcelas({ parcelas, editandoId, onEditar, onBorrar, onMedir, onHistorial, onEjemplos }) {
  return (
    <section className="panel" aria-labelledby="titulo-lista">
      <div className="listado-cabecera">
        <h2 id="titulo-lista">Parcelas</h2>
        <div className="acciones w-full sm:w-auto">
          <button
            type="button"
            id="btn-exportar-parcelas"
            className="btn secundario pequeno flex-1 sm:flex-none"
            onClick={() => exportarParcelas(parcelas)}
          >
            Exportar CSV
          </button>
          <button type="button" id="btn-ejemplos" className="btn ejemplo pequeno flex-1 sm:flex-none" onClick={onEjemplos}>
            Cargar parcelas de ejemplo
          </button>
        </div>
      </div>
      <div className="tabla-scroll">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cultivo</th>
              <th className="num">Superficie</th>
              <th className="num">Humedad</th>
              <th className="num">Ubicación</th>
              <th>Estado</th>
              <th>Notas</th>
              <th><span className="solo-lectores">Acciones</span></th>
            </tr>
          </thead>
          <tbody id="tbody">
            {parcelas.map((parcela) => {
              const ubicacion = parcela.latitud != null && parcela.longitud != null
                ? `${Number(parcela.latitud).toFixed(4)}, ${Number(parcela.longitud).toFixed(4)}`
                : '—';
              const humedad = parcela.humedad_suelo == null
                ? '—'
                : `${Number(parcela.humedad_suelo)} %`;

              return (
                <tr key={parcela.id} className={parcela.id === editandoId ? 'editando' : undefined}>
                  <td data-label="Nombre">{parcela.nombre}</td>
                  <td data-label="Cultivo">{parcela.cultivo}</td>
                  <td className="num" data-label="Superficie">{Number(parcela.superficie_ha)} ha</td>
                  <td className="num" data-label="Humedad">{humedad}</td>
                  <td className="num ubicacion" data-label="Ubicación">{ubicacion}</td>
                  <td data-label="Estado">
                    <span className={`insignia ${parcela.estado}`}>
                      {ETIQUETAS[parcela.estado] ?? parcela.estado}
                    </span>
                  </td>
                  <td className="notas" data-label="Notas">{parcela.notas ?? ''}</td>
                  <td className="botones" data-label="Acciones">
                    <button
                      type="button"
                      className="btn primario pequeno"
                      aria-label={`Registrar lectura de ${parcela.nombre}`}
                      onClick={() => onMedir(parcela)}
                    >
                      Medir
                    </button>
                    <button
                      type="button"
                      className="btn secundario pequeno"
                      aria-label={`Ver historial de ${parcela.nombre}`}
                      onClick={() => onHistorial(parcela)}
                    >
                      Historial
                    </button>
                    <button
                      type="button"
                      className="btn secundario pequeno"
                      aria-label={`Editar ${parcela.nombre}`}
                      onClick={() => onEditar(parcela)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn peligro pequeno"
                      aria-label={`Borrar ${parcela.nombre}`}
                      onClick={() => onBorrar(parcela)}
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p id="vacio" className="vacio" hidden={parcelas.length > 0}>
        Aún no hay parcelas. Añade la primera o carga las parcelas de ejemplo.
      </p>
    </section>
  );
}
