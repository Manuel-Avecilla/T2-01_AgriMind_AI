import { useEffect, useState } from 'react';
import { borrarParcela, insertarEjemplos } from '../datos/parcelas.js';
import { AlertasActivas } from './AlertasActivas.jsx';
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
  onMedir,
  onHistorial,
}) {
  const [editando, setEditando] = useState(null);
  const [aviso, setAviso] = useState({ texto: '', esError: false });

  function avisar(texto, esError = false) {
    setAviso({ texto, esError });
  }

  // Una sesión distinta no debe dejar el formulario editando una parcela ajena.
  useEffect(() => {
    setEditando(null);
    setAviso({ texto: '', esError: false });
  }, [sesion?.user?.id]);

  async function borrar(parcela) {
    if (!window.confirm(`¿Borrar la parcela «${parcela.nombre}»? Esta acción no se puede deshacer.`)) return;
    try {
      await borrarParcela(parcela.id);
      if (editando?.id === parcela.id) setEditando(null);
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
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 id="panel-titulo" tabIndex={-1} className="m-0 text-3xl font-bold tracking-tight text-marino">Panel</h1>
            <p className="mb-0 mt-1 text-tinta-suave">Estado de tus parcelas y alertas pendientes.</p>
          </div>
        </div>

        <Resumen parcelas={parcelas} numeroAlertas={alertas.length} />

        <AlertasActivas alertas={alertas} errorCarga={errorAlertas} recargar={recargar} />

        <main className="grid items-start gap-6 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
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
            onMedir={onMedir}
            onHistorial={onHistorial}
          />
        </main>
      </div>
    </section>
  );
}
