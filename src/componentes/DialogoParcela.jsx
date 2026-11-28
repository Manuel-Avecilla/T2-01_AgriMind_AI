import { Dialogo } from './Dialogo.jsx';
import { FormularioParcela } from './FormularioParcela.jsx';

/** Modal de alta y edición de parcelas; sustituye a la columna lateral. */
export function DialogoParcela({ parcela, aviso, onAvisar, errorCarga, onCerrar, recargar }) {
  return (
    <Dialogo
      id="dialog-parcela"
      tituloId="parcela-titulo"
      titulo={parcela ? `Editar ${parcela.nombre}` : 'Añadir parcela'}
      cerrarId="btn-cerrar-parcela"
      className="dialogo-parcela"
      onCerrar={onCerrar}
    >
      <FormularioParcela
        editando={parcela ?? null}
        onCerrar={onCerrar}
        aviso={aviso}
        onAvisar={onAvisar}
        errorCarga={errorCarga}
        recargar={recargar}
      />
    </Dialogo>
  );
}
