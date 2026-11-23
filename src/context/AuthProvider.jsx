import { useCallback, useEffect, useMemo, useState } from 'react';
import { renovarSesion } from '../services/autenticacion.js';
import { borrarSesion, guardarSesion, leerSesion } from '../services/sesion.js';
import { AuthContext } from './useAuth.js';

export default function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(() => leerSesion());
  const [expirada, setExpirada] = useState(false);

  const entrar = useCallback((respuesta) => {
    guardarSesion(respuesta);
    setSesion(leerSesion());
    setExpirada(false);
  }, []);

  const salir = useCallback(() => {
    borrarSesion();
    setSesion(null);
  }, []);

  const cerrarAviso = useCallback(() => setExpirada(false), []);

  useEffect(() => {
    const alExpirar = () => {
      borrarSesion();
      setSesion(null);
      setExpirada(true);
    };
    window.addEventListener('sesion-expirada', alExpirar);
    return () => window.removeEventListener('sesion-expirada', alExpirar);
  }, []);

  useEffect(() => {
    if (!sesion) return undefined;
    const restante = sesion.expira - Date.now();
    const margen = Math.min(15 * 60 * 1000, Math.max((sesion.expira - sesion.emitido) / 4, 30_000));
    const renovar = window.setTimeout(async () => {
      try {
        entrar(await renovarSesion());
      } catch {
        // Un error de red no cierra una sesión válida; el token se descarta al vencer.
      }
    }, Math.max(restante - margen, 0));
    const vencer = window.setTimeout(() => {
      borrarSesion();
      setSesion(null);
      setExpirada(true);
    }, Math.max(restante, 0));
    return () => {
      window.clearTimeout(renovar);
      window.clearTimeout(vencer);
    };
  }, [sesion, entrar]);

  const valor = useMemo(() => ({
    usuario: sesion?.usuario ?? null,
    rol: sesion?.usuario?.rol ?? null,
    entrar,
    salir,
    expirada,
    cerrarAviso,
  }), [sesion, entrar, salir, expirada, cerrarAviso]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
