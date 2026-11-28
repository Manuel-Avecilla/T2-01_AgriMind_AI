import { useCallback, useEffect, useState } from 'react';
import { borrarParcela, insertarEjemplos } from '../datos/parcelas.js';
import { AlertasActivas } from './AlertasActivas.jsx';
import { DialogoHistorial } from './DialogoHistorial.jsx';
import { DialogoMedir } from './DialogoMedir.jsx';
import { DialogoParcela } from './DialogoParcela.jsx';
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
  const [aviso, setAviso] = useState({ texto: '', esError: false });
  const [dialogo, setDialogo] = useState(null); // { tipo, parcelaId? }

  // La parcela se deriva del listado para no mostrar datos obsoletos tras una
  // recarga. En 'crear' no hay parcela asociada.
  const parcelaDialogo = dialogo?.parcelaId
    ? parcelas.find((parcela) => parcela.id === dialogo.parcelaId) ?? null
    : null;
  const editandoId = dialogo?.tipo === 'editar' ? dialogo.parcelaId : null;

  const cerrarDialogo = useCallback(() => setDialogo(null), []);

  function avisar(texto, esError = false) {
    setAviso({ texto, esError });
  }

  function abrirDialogo(parcela, tipo) {
    setDialogo({ parcelaId: parcela.id, tipo });
  }

  function abrirCreacion() {
    avisar('');
    setDialogo({ tipo: 'crear' });
  }

  function empezarEdicion(parcela) {
    avisar('');
    setDialogo({ parcelaId: parcela.id, tipo: 'editar' });
  }

  // Una sesión distinta no debe dejar un diálogo de otra cuenta abierto.
  useEffect(() => {
    setAviso({ texto: '', esError: false });
    setDialogo(null);
  }, [sesion?.user?.id]);

  async function borrar(parcela) {
    if (!window.confirm(`¿Borrar la parcela «${parcela.nombre}»? Esta acción no se puede deshacer.`)) return;
    try {
      await borrarParcela(parcela.id);
      if (dialogo?.parcelaId === parcela.id) setDialogo(null);
      avisar(`Parcela «${parcela.nombre}» borrada.`);
      await recargar();
    } catch (error) {
      avisar(error.message, true);
    }
  }

  async function ejemplos() {
    if (!window.confirm('Se añadirán 3 parcelas de ejemplo, cada una con 12 lecturas y sus alertas. ¿Continuar?')) return;
    try {
      await insertarEjemplos();
      avisar('Parcelas, lecturas y alertas de ejemplo cargadas.');
      await recargar();
    } catch (error) {
      avisar(error.message, true);
    }
  }

  return (
    <section id="app" aria-labelledby="panel-titulo" className="flex-1" hidden={!visible} aria-busy={cargando || undefined}>
      <div className="contenedor-ancho pb-10 pt-4 sm:pb-12 sm:pt-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-5">
          <div>
            <h1 id="panel-titulo" tabIndex={-1} className="m-0 text-2xl font-bold tracking-tight text-marino sm:text-3xl">Panel</h1>
            <p className="mb-0 mt-1 text-sm text-tinta-suave sm:text-base">Estado de tus parcelas y alertas pendientes.</p>
          </div>
        </div>

        <Resumen parcelas={parcelas} numeroAlertas={alertas.length} />

        <AlertasActivas alertas={alertas} errorCarga={errorAlertas} recargar={recargar} />

        <main className="min-w-0">
          <ListaParcelas
            parcelas={parcelas}
            editandoId={editandoId}
            onCrear={abrirCreacion}
            onEditar={empezarEdicion}
            onBorrar={borrar}
            onEjemplos={ejemplos}
            onMedir={(parcela) => abrirDialogo(parcela, 'medir')}
            onHistorial={(parcela) => abrirDialogo(parcela, 'historial')}
          />
        </main>

        {dialogo?.tipo === 'crear' && (
          <DialogoParcela
            aviso={aviso}
            onAvisar={avisar}
            errorCarga={errorParcelas}
            onCerrar={cerrarDialogo}
            recargar={recargar}
          />
        )}
        {dialogo?.tipo === 'editar' && parcelaDialogo && (
          <DialogoParcela
            parcela={parcelaDialogo}
            aviso={aviso}
            onAvisar={avisar}
            errorCarga={errorParcelas}
            onCerrar={cerrarDialogo}
            recargar={recargar}
          />
        )}
        {dialogo?.tipo === 'medir' && parcelaDialogo && (
          <DialogoMedir
            parcela={parcelaDialogo}
            onCerrar={cerrarDialogo}
            onCambio={recargar}
          />
        )}
        {dialogo?.tipo === 'historial' && parcelaDialogo && (
          <DialogoHistorial
            parcela={parcelaDialogo}
            onCerrar={cerrarDialogo}
          />
        )}
      </div>
    </section>
  );
}
