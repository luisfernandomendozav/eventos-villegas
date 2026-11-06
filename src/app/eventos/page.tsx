'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import EventoCard from '@/components/EventoCard';
import { useSesion } from '@/context/SesionContext';

interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  lugar: string;
  imagen_url: string;
  creador_nombre: string;
  total_participantes: number;
}

export default function Eventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [buscar, setBuscar] = useState('');
  const [cargando, setCargando] = useState(true);
  const { sesion } = useSesion();

  const cargar = useCallback(async () => {
    setCargando(true);
    const res = await fetch(`/api/eventos?q=${encodeURIComponent(buscar)}`);
    const data = await res.json();
    setEventos(data);
    setCargando(false);
  }, [buscar]);

  useEffect(() => {
    const timer = setTimeout(cargar, 300);
    return () => clearTimeout(timer);
  }, [cargar]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-violet-900">Eventos</h1>
          <p className="text-gray-500 text-sm mt-1">Descubre y participa en eventos</p>
        </div>
        {sesion && (
          <Link
            href="/eventos/nuevo"
            className="bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-violet-800 transition-colors shadow-sm"
          >
            + Crear evento
          </Link>
        )}
      </div>

      <div className="mb-6">
        <input
          type="search"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          placeholder="Buscar eventos..."
          className="w-full max-w-md border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 shadow-sm"
        />
      </div>

      {cargando ? (
        <div className="text-center py-16 text-gray-400">Cargando eventos...</div>
      ) : eventos.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-gray-500 text-lg">No hay eventos aún.</p>
          {sesion && (
            <Link href="/eventos/nuevo" className="mt-4 inline-block text-violet-700 font-medium hover:underline">
              ¡Crea el primero!
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventos.map((e) => (
            <EventoCard key={e.id} evento={e} />
          ))}
        </div>
      )}
    </div>
  );
}
