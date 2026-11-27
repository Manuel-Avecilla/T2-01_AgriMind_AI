import { useCallback, useEffect, useRef, useState } from 'react';
import { cargarAlertasActivas } from '../datos/alertas.js';
import { cargarParcelas } from '../datos/parcelas.js';

/**
 * Carga parcelas y alertas en paralelo y expone una recarga para usarla tras
 * cada cambio. Los contadores se derivan en los componentes, nunca se duplican.
 */
export function usePanel({ sesion, sesionConocida }) {
  const [parcelas, setParcelas] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [errorParcelas, setErrorParcelas] = useState('');
  const [errorAlertas, setErrorAlertas] = useState('');
  const generacionRef = useRef(0);

  const recargar = useCallback(async () => {
    const generacion = generacionRef.current;
    setCargando(true);
    const [resultadoParcelas, resultadoAlertas] = await Promise.allSettled([
      cargarParcelas(),
      cargarAlertasActivas(),
    ]);
    if (generacion !== generacionRef.current) return;

    if (resultadoParcelas.status === 'fulfilled') {
      setParcelas(resultadoParcelas.value);
      setErrorParcelas('');
    } else {
      setErrorParcelas(resultadoParcelas.reason?.message || 'No se pudieron cargar las parcelas.');
    }
    if (resultadoAlertas.status === 'fulfilled') {
      setAlertas(resultadoAlertas.value);
      setErrorAlertas('');
    } else {
      setErrorAlertas(resultadoAlertas.reason?.message || 'No se pudieron cargar las alertas.');
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    generacionRef.current += 1;
    if (!sesionConocida || !sesion) {
      setParcelas([]);
      setAlertas([]);
      setErrorParcelas('');
      setErrorAlertas('');
      setCargando(false);
      return;
    }
    recargar();
  }, [sesion, sesionConocida, recargar]);

  return { parcelas, alertas, cargando, errorParcelas, errorAlertas, recargar };
}
