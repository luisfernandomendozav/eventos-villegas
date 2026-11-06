'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Sesion {
  id: string;
  nombre: string;
  email: string;
}

interface CtxSesion {
  sesion: Sesion | null;
  cargando: boolean;
  refrescar: () => void;
}

const Ctx = createContext<CtxSesion>({ sesion: null, cargando: true, refrescar: () => {} });

export function SesionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [cargando, setCargando] = useState(true);

  const refrescar = () => {
    setCargando(true);
    fetch('/api/auth/sesion')
      .then((r) => r.json())
      .then((d) => setSesion(d.sesion))
      .finally(() => setCargando(false));
  };

  useEffect(refrescar, []);

  return <Ctx.Provider value={{ sesion, cargando, refrescar }}>{children}</Ctx.Provider>;
}

export const useSesion = () => useContext(Ctx);
