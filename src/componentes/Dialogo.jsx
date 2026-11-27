import { useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Envoltorio de los diálogos nativos: abre en la capa superior, centra el
 * contenido y notifica al padre cuando se cierra por Esc o por el botón.
 */
export function Dialogo({ id, tituloId, titulo, cerrarId, className = '', onCerrar, children }) {
  const dialogoRef = useRef(null);

  // Layout effect: showModal() ocurre antes de los efectos de los hijos que
  // colocan el foco, para que no se pierda al abrir el modal.
  useLayoutEffect(() => {
    const dialogo = dialogoRef.current;
    if (dialogo && !dialogo.open) dialogo.showModal();
  }, []);

  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (!dialogo) return undefined;
    const alCerrar = () => onCerrar();
    dialogo.addEventListener('close', alCerrar);
    return () => dialogo.removeEventListener('close', alCerrar);
  }, [onCerrar]);

  return (
    <dialog ref={dialogoRef} id={id} className={`dialogo ${className}`} aria-labelledby={tituloId}>
      <div className="dialogo-cabecera">
        <div className="min-w-0">
          <p className="m-0 text-xs font-semibold uppercase tracking-wide text-tinta-suave">Parcela</p>
          <h2 id={tituloId} className="m-0 truncate text-xl text-marino">{titulo}</h2>
        </div>
        <button
          type="button"
          id={cerrarId}
          className="btn secundario pequeno shrink-0"
          aria-label="Cerrar ventana"
          onClick={() => dialogoRef.current?.close()}
        >
          Cerrar
        </button>
      </div>
      {children}
    </dialog>
  );
}
