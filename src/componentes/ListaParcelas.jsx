import { useEffect, useState } from 'react';
import { exportarParcelas } from '../datos/csv.js';

const ETIQUETAS = { verde: 'Verde', amarillo: 'Amarillo', rojo: 'Rojo' };

export function ListaParcelas({
  parcelas,
  editandoId,
  onCrear,
  onEditar,
  onBorrar,
  onMedir,
  onHistorial,
  onEjemplos,
}) {
  const [menuAbiertoId, setMenuAbiertoId] = useState(null);

  // Cierra el desplegable al pulsar fuera o con Escape.
  useEffect(() => {
    if (menuAbiertoId == null) return undefined;
    const alPointer = (evento) => {
      const dentro = evento.target instanceof Element
        ? evento.target.closest('[data-acciones-parcela]')
        : null;
      if (!dentro) setMenuAbiertoId(null);
    };
    const alTecla = (evento) => {
      if (evento.key === 'Escape') setMenuAbiertoId(null);
    };
    document.addEventListener('pointerdown', alPointer);
    document.addEventListener('keydown', alTecla);
    return () => {
      document.removeEventListener('pointerdown', alPointer);
      document.removeEventListener('keydown', alTecla);
    };
  }, [menuAbiertoId]);

  function ejecutar(accion) {
    setMenuAbiertoId(null);
    accion();
  }

  return (
    <section className="panel" aria-labelledby="titulo-lista">
      <div className="listado-cabecera">
        <div className="flex items-center gap-2">
          <h2 id="titulo-lista">Parcelas</h2>
          <button
            type="button"
            id="btn-crear-parcela"
            className="btn primario pequeno icono"
            aria-label="Añadir parcela"
            title="Añadir parcela"
            onClick={onCrear}
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>
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
              const abierto = menuAbiertoId === parcela.id;

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
                    <div className="flex flex-wrap items-center gap-2" data-acciones-parcela>
                      <button
                        type="button"
                        className="btn secundario pequeno icono"
                        aria-label={`Acciones de ${parcela.nombre}`}
                        aria-haspopup="true"
                        aria-expanded={abierto}
                        aria-controls={`acciones-${parcela.id}`}
                        onClick={() => setMenuAbiertoId(abierto ? null : parcela.id)}
                      >
                        <span aria-hidden="true">⋮</span>
                      </button>
                      {abierto && (
                        <div id={`acciones-${parcela.id}`} className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn primario pequeno"
                            aria-label={`Registrar lectura de ${parcela.nombre}`}
                            onClick={() => ejecutar(() => onMedir(parcela))}
                          >
                            Medir
                          </button>
                          <button
                            type="button"
                            className="btn secundario pequeno"
                            aria-label={`Ver historial de ${parcela.nombre}`}
                            onClick={() => ejecutar(() => onHistorial(parcela))}
                          >
                            Historial
                          </button>
                          <button
                            type="button"
                            className="btn secundario pequeno"
                            aria-label={`Editar ${parcela.nombre}`}
                            onClick={() => ejecutar(() => onEditar(parcela))}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn peligro pequeno"
                            aria-label={`Borrar ${parcela.nombre}`}
                            onClick={() => ejecutar(() => onBorrar(parcela))}
                          >
                            Borrar
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p id="vacio" className="vacio" hidden={parcelas.length > 0}>
        Aún no hay parcelas. Pulsa «+» para añadir la primera o carga las de ejemplo.
      </p>
    </section>
  );
}
