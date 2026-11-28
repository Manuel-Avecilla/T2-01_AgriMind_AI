import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { exportarParcelas } from '../datos/csv.js';

const ETIQUETAS = { verde: 'Verde', amarillo: 'Amarillo', rojo: 'Rojo' };
const DURACION_CIERRE = 150; // Coincide con la transición de .menu-acciones en styles.css.

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
  const [menuVisible, setMenuVisible] = useState(false);
  const botonRef = useRef(null);
  const menuRef = useRef(null);
  const temporizadorRef = useRef(null);

  const parcelaMenu = parcelas.find((parcela) => parcela.id === menuAbiertoId);

  function limpiarTemporizador() {
    if (temporizadorRef.current != null) {
      clearTimeout(temporizadorRef.current);
      temporizadorRef.current = null;
    }
  }

  // El menú vive en el body (portal), así que se coloca según el botón que lo abrió.
  function colocarMenu() {
    const menu = menuRef.current;
    const boton = botonRef.current;
    if (!menu || !boton) return;

    const rect = boton.getBoundingClientRect();
    const ancho = menu.offsetWidth;
    const alto = menu.offsetHeight;
    const margen = 8;
    const separacion = 6;

    let izquierda = rect.right - ancho;
    if (izquierda < margen) izquierda = rect.left;
    izquierda = Math.max(margen, Math.min(izquierda, window.innerWidth - ancho - margen));

    const cabeAbajo = rect.bottom + separacion + alto <= window.innerHeight - margen;
    const arriba = rect.top - separacion - alto;
    const top = cabeAbajo ? rect.bottom + separacion : Math.max(margen, arriba);
    const alineadoDerecha = Math.abs(izquierda + ancho - rect.right) <= 2;

    menu.style.left = `${Math.round(izquierda)}px`;
    menu.style.top = `${Math.round(top)}px`;
    menu.style.transformOrigin = `${cabeAbajo ? 'top' : 'bottom'} ${alineadoDerecha ? 'right' : 'left'}`;
  }

  function abrirMenu(parcela, evento) {
    limpiarTemporizador();
    botonRef.current = evento.currentTarget;
    if (menuAbiertoId === parcela.id) {
      // Se pulsó de nuevo mientras se estaba cerrando: solo se revela.
      setMenuVisible(true);
      return;
    }
    setMenuAbiertoId(parcela.id);
    setMenuVisible(false);
  }

  function cerrarMenu(devolverFoco = false) {
    limpiarTemporizador();
    setMenuVisible(false);
    temporizadorRef.current = setTimeout(() => {
      setMenuAbiertoId(null);
      temporizadorRef.current = null;
    }, DURACION_CIERRE);
    if (devolverFoco) botonRef.current?.focus();
  }

  function ejecutar(accion) {
    cerrarMenu();
    accion();
  }

  useLayoutEffect(() => {
    if (menuAbiertoId == null) return undefined;
    colocarMenu();
    const alAjustar = () => colocarMenu();
    window.addEventListener('scroll', alAjustar, true);
    window.addEventListener('resize', alAjustar);
    return () => {
      window.removeEventListener('scroll', alAjustar, true);
      window.removeEventListener('resize', alAjustar);
    };
  }, [menuAbiertoId]);

  // Un frame con opacity-0/scale-96 antes de mostrarlo para que la entrada se anime.
  useEffect(() => {
    if (menuAbiertoId == null || menuVisible) return undefined;
    const cuadro = requestAnimationFrame(() => setMenuVisible(true));
    return () => cancelAnimationFrame(cuadro);
  }, [menuAbiertoId, menuVisible]);

  useEffect(() => {
    if (!menuVisible) return;
    menuRef.current?.querySelector('button')?.focus();
  }, [menuVisible]);

  // Cierra por clic fuera (el botón y el propio menú se excluyen) y con Escape.
  useEffect(() => {
    if (menuAbiertoId == null) return undefined;
    const alPointer = (evento) => {
      if (!(evento.target instanceof Element)) return;
      if (menuRef.current?.contains(evento.target)) return;
      if (botonRef.current?.contains(evento.target)) return;
      cerrarMenu();
    };
    const alTecla = (evento) => {
      if (evento.key === 'Escape') cerrarMenu(true);
    };
    document.addEventListener('pointerdown', alPointer);
    document.addEventListener('keydown', alTecla);
    return () => {
      document.removeEventListener('pointerdown', alPointer);
      document.removeEventListener('keydown', alTecla);
    };
  }, [menuAbiertoId]);

  useEffect(() => () => limpiarTemporizador(), []);

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
              const abierto = menuVisible && menuAbiertoId === parcela.id;

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
                        aria-controls={abierto ? `acciones-${parcela.id}` : undefined}
                        onClick={(evento) => {
                          if (abierto) cerrarMenu();
                          else abrirMenu(parcela, evento);
                        }}
                      >
                        <span aria-hidden="true" className="text-xl leading-none">{abierto ? '×' : '⋮'}</span>
                      </button>
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
      {menuAbiertoId != null && parcelaMenu && createPortal(
        <div
          ref={menuRef}
          id={`acciones-${parcelaMenu.id}`}
          role="group"
          aria-label={`Acciones de ${parcelaMenu.nombre}`}
          className={`menu-acciones${menuVisible ? ' menu-acciones-abierto' : ''}`}
        >
          <button
            type="button"
            className="menu-acciones-item primario"
            aria-label={`Registrar lectura de ${parcelaMenu.nombre}`}
            onClick={() => ejecutar(() => onMedir(parcelaMenu))}
          >
            Medir
          </button>
          <button
            type="button"
            className="menu-acciones-item"
            aria-label={`Ver historial de ${parcelaMenu.nombre}`}
            onClick={() => ejecutar(() => onHistorial(parcelaMenu))}
          >
            Historial
          </button>
          <button
            type="button"
            className="menu-acciones-item"
            aria-label={`Editar ${parcelaMenu.nombre}`}
            onClick={() => ejecutar(() => onEditar(parcelaMenu))}
          >
            Editar
          </button>
          <button
            type="button"
            className="menu-acciones-item peligro"
            aria-label={`Borrar ${parcelaMenu.nombre}`}
            onClick={() => ejecutar(() => onBorrar(parcelaMenu))}
          >
            Borrar
          </button>
        </div>,
        document.body,
      )}
    </section>
  );
}
