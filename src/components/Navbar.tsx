'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSesion } from '@/context/SesionContext';

export default function Navbar() {
  const { sesion, cargando, refrescar } = useSesion();
  const router = useRouter();

  const cerrar = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    refrescar();
    router.push('/');
  };

  return (
    <nav className="bg-violet-700 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-90">
          🎉 Eventos Villegas
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/eventos" className="hover:text-violet-200 transition-colors">
            Eventos
          </Link>

          {!cargando && (
            <>
              {sesion ? (
                <>
                  <Link
                    href="/eventos/nuevo"
                    className="bg-white text-violet-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors"
                  >
                    + Crear evento
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-violet-200">Hola, {sesion.nombre.split(' ')[0]}</span>
                    <button
                      onClick={cerrar}
                      className="bg-violet-600 hover:bg-violet-500 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Salir
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:text-violet-200 transition-colors">
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/registro"
                    className="bg-white text-violet-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
