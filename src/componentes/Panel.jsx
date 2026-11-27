import { useCallback, useEffect, useState } from 'react';
import { borrarParcela, insertarEjemplos } from '../datos/parcelas.js';
import { AlertasActivas } from './AlertasActivas.jsx';
import { DialogoHistorial } from './DialogoHistorial.jsx';
import { DialogoMedir } from './DialogoMedir.jsx';
import { FormularioParcela } from './FormularioParcela.jsx';
import { ListaParcelas } from './ListaParcelas.jsx';
import { Resumen } from './Resumen.jsx';

export function Panel({
  visible,
  sesion,
  parcelas,
  alertas,
  cargando,
  errorParcelas,
  errorAlertas,
  recargar,
}) {
  const [editando, setEditando] = useState(null);
  const [aviso, setAviso] = useState({ texto: '', esError: false });
  const [dialogo, setDialogo] = useState(null); // { parcelaId, tipo }

  // La parcela se deriva del listado: tras guardar, onCambio() actualiza el
  // estado del panel antes de cerrar el modal.
  const parcelaDialogo = dialogo
    ? parcelas.find((parcela) => parcela.id === dialogo.parcelaId) ?? null
    : null;

  const cerrarDialogo = useCallback(() => setDialogo(null), []);

  function avisar(texto, esError = false) {
    setAviso({ texto, esError });
  }

  function abrirDialogo(parcela, tipo) {
    setDialogo({ parcelaId: parcela.id, tipo });
  }

  // Una sesión distinta no debe dejar el formulario ni el diálogo de una
  // parcela ajena abiertos.
  useEffect(() => {
    setEditando(null);
    setAviso({ texto: '', esError: false });
    setDialogo(null);
  }, [sesion?.user?.id]);

  async function borrar(parcela) {
    if (!window.confirm(`¿Borrar la parcela «${parcela.nombre}»? Esta acción no se puede deshacer.`)) return;
    try {
      await borrarParcela(parcela.id);
      if (editando?.id === parcela.id) setEditando(null);
      if (dialogo?.parcelaId === parcela.id) setDialogo(null);
      avisar(`Parcela «${parcela.nombre}» borrada.`);
      await recargar();
    } catch (error) {
      avisar(error.message, true);
    }
  }

  async function ejemplos() {
    if (!window.confirm('Se añadirán las 3 parcelas de ejemplo a tu cuenta. ¿Continuar?')) return;
    try {
      await insertarEjemplos();
      avisar('Parcelas de ejemplo cargadas.');
      await recargar();
    } catch (error) {
      avisar(error.message, true);
    }
  }

  function empezarEdicion(parcela) {
    avisar('');
    setEditando(parcela);
  }

  return (
    <section id="app" aria-labelledby="panel-titulo" className="flex-1" hidden={!visible} aria-busy={cargando || undefined}>
      <div className="contenedor-ancho pb-12 pt-5 sm:pb-14 sm:pt-7">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
          <div>
            <h1 id="panel-titulo" tabIndex={-1} className="m-0 text-2xl font-bold tracking-tight text-marino sm:text-3xl">Panel</h1>
            <p className="mb-0 mt-1 text-sm text-tinta-suave sm:text-base">Estado de tus parcelas y alertas pendientes.</p>
          </div>
        </div>

        <Resumen parcelas={parcelas} numeroAlertas={alertas.length} />

        <AlertasActivas alertas={alertas} errorCarga={errorAlertas} recargar={recargar} />

        <main className="grid items-start gap-5 xl:grid-cols-[minmax(240px,300px)_minmax(0,1fr)]">
          <FormularioParcela
            editando={editando}
            onCambiarEditando={setEditando}
            aviso={aviso}
            onAvisar={avisar}
            errorCarga={errorParcelas}
            recargar={recargar}
          />
          <ListaParcelas
            parcelas={parcelas}
            editandoId={editando?.id ?? null}
            onEditar={empezarEdicion}
            onBorrar={borrar}
            onEjemplos={ejemplos}
            onMedir={(parcela) => abrirDialogo(parcela, 'medir')}
            onHistorial={(parcela) => abrirDialogo(parcela, 'historial')}
          />
        </main>

        {dialogo && parcelaDialogo && (
          dialogo.tipo === 'medir' ? (
            <DialogoMedir
              parcela={parcelaDialogo}
              onCerrar={cerrarDialogo}
              onCambio={recargar}
            />
          ) : (
            <DialogoHistorial
              parcela={parcelaDialogo}
              onCerrar={cerrarDialogo}
            />
          )
        )}
      </div>
    </section>
  );
}
