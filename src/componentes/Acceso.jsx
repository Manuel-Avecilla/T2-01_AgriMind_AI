import { useEffect, useRef, useState } from 'react';
import {
  errorCorreo,
  esErrorDeEspera,
  iniciarSesion,
  iniciarSesionConGoogle,
  mensajeErrorAuth,
  registrarUsuario,
} from '../datos/auth.js';

const PESTANAS = [
  { id: 'login', tabId: 'auth-volver', texto: 'Iniciar sesión' },
  { id: 'registro', tabId: 'auth-cambiar', texto: 'Crear cuenta' },
];

/** Estado de cada acción: 'libre', 'cargando' o 'espera' (rate limit). */
function useAccionAuth(textoCarga) {
  const [modo, setModo] = useState('libre');
  const [etiqueta, setEtiqueta] = useState(null);
  const modoRef = useRef('libre');
  const temporizadorRef = useRef(null);
  const vivoRef = useRef(true);

  useEffect(() => () => {
    vivoRef.current = false;
    if (temporizadorRef.current !== null) clearInterval(temporizadorRef.current);
  }, []);

  function cambiar(nuevoModo, nuevaEtiqueta = null) {
    if (!vivoRef.current) return;
    modoRef.current = nuevoModo;
    setModo(nuevoModo);
    setEtiqueta(nuevaEtiqueta);
  }

  async function ejecutar(accion) {
    if (modoRef.current !== 'libre') return { ok: false, descartado: true };
    cambiar('cargando', textoCarga);
    try {
      const data = await accion();
      cambiar('libre');
      return { ok: true, data };
    } catch (error) {
      if (esErrorDeEspera(error)) {
        cambiar('espera', 'Reintentar en 60s');
        let restante = 60;
        if (temporizadorRef.current !== null) clearInterval(temporizadorRef.current);
        temporizadorRef.current = setInterval(() => {
          if (!vivoRef.current) return;
          restante -= 1;
          if (restante <= 0) {
            clearInterval(temporizadorRef.current);
            temporizadorRef.current = null;
            cambiar('libre');
          } else {
            cambiar('espera', `Reintentar en ${restante}s`);
          }
        }, 1000);
      } else {
        cambiar('libre');
      }
      return { ok: false, error };
    }
  }

  return { ocupado: modo !== 'libre', etiqueta, ejecutar };
}

function CampoPassword({ id, etiqueta, autoComplete, valor, alCambiar, inputRef }) {
  const [visible, setVisible] = useState(false);

  function alternar() {
    setVisible((actual) => !actual);
    inputRef.current?.focus({ preventScroll: true });
  }

  return (
    <>
      <label htmlFor={id}>{etiqueta}</label>
      <div className="campo-password">
        <input
          id={id}
          ref={inputRef}
          type={visible ? 'text' : 'password'}
          value={valor}
          onChange={(evento) => alCambiar(evento.target.value)}
          required
          minLength={6}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          id={`toggle-${id}`}
          className="btn-toggle-password"
          aria-controls={id}
          aria-pressed={visible}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onClick={alternar}
        >
          {visible ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
    </>
  );
}

export function Acceso({ visible, tabSolicitado }) {
  const [tab, setTab] = useState(tabSolicitado ?? 'login');
  const [aviso, setAviso] = useState({ texto: '', esError: false });
  const [login, setLogin] = useState({ email: '', password: '' });
  const [registro, setRegistro] = useState({ nombre: '', email: '', password: '' });

  const tabRefs = useRef({});
  const formLoginRef = useRef(null);
  const formRegistroRef = useRef(null);
  const emailLoginRef = useRef(null);
  const nombreRegistroRef = useRef(null);
  const emailRegistroRef = useRef(null);
  const passwordRegistroRef = useRef(null);

  const accionLogin = useAccionAuth('Entrando…');
  const accionRegistro = useAccionAuth('Creando cuenta…');
  const accionGoogle = useAccionAuth('Conectando con Google…');

  function avisar(texto, esError = false) {
    setAviso({ texto, esError });
  }

  function limpiarAviso() {
    avisar('');
  }

  function seleccionarTab(cual, conFoco = false) {
    setTab(cual);
    limpiarAviso();
    if (conFoco) tabRefs.current[cual]?.focus();
  }

  // El router indicaba la pestaña con ?tab=registro; el cambio de pestaña
  // local no altera el hash, igual que en la vista anterior.
  useEffect(() => {
    if (tabSolicitado) seleccionarTab(tabSolicitado);
  }, [tabSolicitado]);

  function alPulsarTab(evento, indice) {
    let siguiente = null;
    if (evento.key === 'ArrowRight') siguiente = (indice + 1) % PESTANAS.length;
    else if (evento.key === 'ArrowLeft') siguiente = (indice - 1 + PESTANAS.length) % PESTANAS.length;
    else if (evento.key === 'Home') siguiente = 0;
    else if (evento.key === 'End') siguiente = PESTANAS.length - 1;
    if (siguiente === null) return;
    evento.preventDefault();
    seleccionarTab(PESTANAS[siguiente].id, true);
  }

  async function enviarLogin(evento) {
    evento.preventDefault();
    if (!formLoginRef.current?.reportValidity()) return;

    const email = login.email.trim();
    const problema = errorCorreo(email);
    if (problema) {
      avisar(problema, true);
      emailLoginRef.current?.focus();
      return;
    }

    limpiarAviso();
    const resultado = await accionLogin.ejecutar(() => iniciarSesion({ email, password: login.password }));
    // El listener de useSesion se encarga de entrar al panel.
    if (!resultado.ok && !resultado.descartado) avisar(mensajeErrorAuth(resultado.error), true);
  }

  async function enviarRegistro(evento) {
    evento.preventDefault();
    if (!formRegistroRef.current?.reportValidity()) return;

    const nombre = registro.nombre.trim();
    const email = registro.email.trim();
    if (!nombre) {
      avisar('Indica tu nombre para crear la cuenta.', true);
      nombreRegistroRef.current?.focus();
      return;
    }
    const problema = errorCorreo(email);
    if (problema) {
      avisar(problema, true);
      emailRegistroRef.current?.focus();
      return;
    }
    if (registro.password.length < 6) {
      avisar('La contraseña debe tener al menos 6 caracteres.', true);
      passwordRegistroRef.current?.focus();
      return;
    }

    limpiarAviso();
    const resultado = await accionRegistro.ejecutar(() => registrarUsuario({ nombre, email, password: registro.password }));
    if (!resultado.ok) {
      if (!resultado.descartado) avisar(mensajeErrorAuth(resultado.error), true);
      return;
    }

    const data = resultado.data;
    if (data.session) {
      avisar('Cuenta creada. Entrando al panel…');
      return;
    }
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      avisar('Ya existe una cuenta con ese correo. Inicia sesión.', true);
      return;
    }
    avisar('Cuenta creada. Revisa tu correo para confirmarla antes de entrar.');
  }

  async function conGoogle() {
    limpiarAviso();
    const resultado = await accionGoogle.ejecutar(iniciarSesionConGoogle);
    // Redirección externa; si no ocurre, el estado se restaura solo.
    if (!resultado.ok && !resultado.descartado) avisar(mensajeErrorAuth(resultado.error), true);
  }

  return (
    <section id="auth" aria-labelledby="auth-titulo" className="flex-1" hidden={!visible}>
      <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-14 sm:px-6">
        <div className="auth-caja">
          <svg className="mx-auto mb-3 h-12 w-12" aria-hidden="true" focusable="false" viewBox="0 0 48 48">
            <path d="M27.5 4.5c-8.7 0-15.8 7-15.8 15.6 0 3.4 1.1 6.6 3 9.2v6.2c0 1.9 1.5 3.4 3.4 3.4h12.4V4.5h-.8Z" fill="#0f2a47"/>
            <circle cx="23.5" cy="17.5" r="4.2" fill="#f08a24"/>
            <g stroke="#f08a24" strokeWidth="1.4" strokeLinecap="round">
              <path d="M23.5 9.5v2.2M16 17.5h2.2M28.8 17.5h2.2M18.2 12.2l1.6 1.6M28.8 12.2l-1.6 1.6"/>
            </g>
            <path d="M13 27.5h17v3H13z" fill="#2fbf86"/>
            <path d="M14.5 31.5h15.5v3H14.5z" fill="#1f9d63"/>
            <path d="M16 35.5h14v3H16z" fill="#16794d"/>
            <path d="M28 38.5c3.6-.6 6.2-2.7 7-6.2-3.7.3-6.4 2.4-7 6.2Z" fill="#2fbf86"/>
          </svg>
          <h1 id="auth-titulo" tabIndex={-1} className="m-0 text-center text-2xl font-bold text-marino">AgriMind AI</h1>
          <p className="mb-6 mt-1 text-center text-sm text-tinta-suave">Tus parcelas y su estado de riego</p>

          <div role="tablist" aria-label="Acceso" className="mb-6 grid grid-cols-2 gap-1 border-b border-borde">
            {PESTANAS.map(({ id, tabId, texto }, indice) => (
              <button
                key={id}
                type="button"
                id={tabId}
                ref={(nodo) => { tabRefs.current[id] = nodo; }}
                role="tab"
                aria-controls={id}
                aria-selected={tab === id}
                tabIndex={tab === id ? 0 : -1}
                onClick={() => seleccionarTab(id, true)}
                onKeyDown={(evento) => alPulsarTab(evento, indice)}
                className={`-mb-px border-b-2 bg-transparent px-2 py-2.5 text-sm font-semibold ${tab === id ? 'border-esmeralda text-esmeralda-osc' : 'border-transparent text-tinta-suave'}`}
              >
                {texto}
              </button>
            ))}
          </div>

          <button
            type="button"
            id="btn-google"
            className="btn btn-google w-full"
            disabled={accionGoogle.ocupado}
            aria-busy={accionGoogle.ocupado || undefined}
            onClick={conGoogle}
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.36-.18-2.02H12v3.83h5.4a4.62 4.62 0 0 1-2 3.03v2.5h3.23c1.89-1.74 2.97-4.3 2.97-7.34Z"/>
              <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.23-2.5c-.9.6-2.05.95-3.4.95-2.61 0-4.83-1.76-5.62-4.13H3.04v2.58A9.99 9.99 0 0 0 12 22Z"/>
              <path fill="#FBBC05" d="M6.38 13.89A6 6 0 0 1 6.06 12c0-.66.11-1.29.32-1.89V7.53H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.47l3.34-2.58Z"/>
              <path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.83 1.49l2.87-2.87C16.96 2.99 14.69 2 12 2A9.99 9.99 0 0 0 3.04 7.53l3.34 2.58c.79-2.37 3.01-4.15 5.62-4.15Z"/>
            </svg>
            <span>{accionGoogle.etiqueta ?? 'Continuar con Google'}</span>
          </button>

          <div className="auth-separador" aria-hidden="true"><span>o con tu correo</span></div>

          <div id="login" role="tabpanel" aria-labelledby="auth-volver" hidden={tab !== 'login'}>
            <form id="form-login" ref={formLoginRef} noValidate onSubmit={enviarLogin}>
              <label htmlFor="login-email">Correo electrónico</label>
              <input
                id="login-email"
                ref={emailLoginRef}
                type="email"
                value={login.email}
                onChange={(evento) => setLogin((actual) => ({ ...actual, email: evento.target.value }))}
                required
                autoComplete="email"
                inputMode="email"
              />

              <CampoPassword
                id="login-password"
                etiqueta="Contraseña"
                autoComplete="current-password"
                valor={login.password}
                alCambiar={(valor) => setLogin((actual) => ({ ...actual, password: valor }))}
              />

              <button
                type="submit"
                id="btn-login"
                className="btn primario mt-6 w-full"
                disabled={accionLogin.ocupado}
                aria-busy={accionLogin.ocupado || undefined}
              >
                {accionLogin.etiqueta ?? 'Entrar'}
              </button>
            </form>
          </div>

          <div id="registro" role="tabpanel" aria-labelledby="auth-cambiar" hidden={tab !== 'registro'}>
            <form id="form-registro" ref={formRegistroRef} noValidate onSubmit={enviarRegistro}>
              <label htmlFor="registro-nombre">Nombre</label>
              <input
                id="registro-nombre"
                ref={nombreRegistroRef}
                type="text"
                value={registro.nombre}
                onChange={(evento) => setRegistro((actual) => ({ ...actual, nombre: evento.target.value }))}
                maxLength={100}
                required
                autoComplete="name"
              />

              <label htmlFor="registro-email">Correo electrónico</label>
              <input
                id="registro-email"
                ref={emailRegistroRef}
                type="email"
                value={registro.email}
                onChange={(evento) => setRegistro((actual) => ({ ...actual, email: evento.target.value }))}
                required
                autoComplete="email"
                inputMode="email"
              />

              <CampoPassword
                id="registro-password"
                etiqueta="Contraseña"
                autoComplete="new-password"
                valor={registro.password}
                alCambiar={(valor) => setRegistro((actual) => ({ ...actual, password: valor }))}
                inputRef={passwordRegistroRef}
              />
              <p className="ayuda mt-2">Mínimo 6 caracteres.</p>

              <button
                type="submit"
                id="btn-registro"
                className="btn primario mt-6 w-full"
                disabled={accionRegistro.ocupado}
                aria-busy={accionRegistro.ocupado || undefined}
              >
                {accionRegistro.etiqueta ?? 'Crear cuenta'}
              </button>
            </form>
          </div>

          <p id="auth-mensaje" className={aviso.esError ? 'mensaje error' : 'mensaje'} role="status" aria-live="polite">{aviso.texto}</p>
          <p className="mb-0 mt-4 text-center text-xs text-tinta-suave">Tus datos son tuyos: puedes exportarlos a CSV cuando quieras.</p>
        </div>
      </div>
    </section>
  );
}
