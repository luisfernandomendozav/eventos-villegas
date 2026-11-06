'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSesion } from '@/context/SesionContext';

interface Participante {
  id: string;
  usuario_id: string;
  nombre: string;
  email: string;
  avatar_url: string | null;
  estado: string;
}

interface Lista {
  id: string;
  nombre: string;
  descripcion: string | null;
  creador_nombre: string;
  total_articulos: number;
  articulos_completados: number;
}

interface Evento {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  lugar: string | null;
  imagen_url: string | null;
  creador_id: string;
  creador_nombre: string;
  participantes: Participante[];
  listas: Lista[];
}

export default function DetalleEvento() {
  const { id } = useParams<{ id: string }>();
  const { sesion } = useSesion();
  const router = useRouter();

  const [evento, setEvento] = useState<Evento | null>(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoAccion, setCargandoAccion] = useState(false);
  const [nuevaLista, setNuevaLista] = useState({ nombre: '', descripcion: '' });
  const [mostrarFormLista, setMostrarFormLista] = useState(false);

  const cargar = useCallback(async () => {
    const res = await fetch(`/api/eventos/${id}`);
    if (!res.ok) { router.push('/eventos'); return; }
    const data = await res.json();
    setEvento(data);
    setCargando(false);
  }, [id, router]);

  useEffect(() => { cargar(); }, [cargar]);

  const participando = evento?.participantes.some((p) => p.usuario_id === sesion?.id);
  const esCreador = evento?.creador_id === sesion?.id;

  const toggleParticipacion = async () => {
    if (!sesion) { router.push('/login'); return; }
    setCargandoAccion(true);
    await fetch(`/api/eventos/${id}/participar`, {
      method: participando ? 'DELETE' : 'POST',
    });
    await cargar();
    setCargandoAccion(false);
  };

  const crearLista = async () => {
    if (!nuevaLista.nombre.trim()) return;
    const res = await fetch(`/api/eventos/${id}/listas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevaLista),
    });
    if (res.ok) {
      setNuevaLista({ nombre: '', descripcion: '' });
      setMostrarFormLista(false);
      await cargar();
    }
  };

  const eliminarEvento = async () => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;
    await fetch(`/api/eventos/${id}`, { method: 'DELETE' });
    router.push('/eventos');
  };

  if (cargando) {
    return <div className="text-center py-20 text-gray-400">Cargando evento...</div>;
  }

  if (!evento) return null;

  const fecha = new Date(evento.fecha);
  const diaCompleto = fecha.toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const hora = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/eventos" className="text-violet-600 text-sm hover:underline">
        ← Volver a eventos
      </Link>

      {/* Encabezado del evento */}
      <div className="mt-4 bg-white rounded-2xl shadow-sm border border-violet-100 overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center overflow-hidden">
          {evento.imagen_url ? (
            <img src={evento.imagen_url} alt={evento.titulo} className="w-full h-full object-cover" />
          ) : (
            <span className="text-7xl">🎉</span>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-violet-900">{evento.titulo}</h1>
              {evento.descripcion && (
                <p className="text-gray-600 mt-2 leading-relaxed">{evento.descripcion}</p>
              )}
            </div>
            <div className="flex gap-2">
              {esCreador && (
                <button
                  onClick={eliminarEvento}
                  className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Eliminar
                </button>
              )}
              <button
                onClick={toggleParticipacion}
                disabled={cargandoAccion || (esCreador && participando)}
                className={`font-semibold px-5 py-2 rounded-lg transition-colors text-sm ${
                  participando
                    ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                    : 'bg-violet-700 text-white hover:bg-violet-800'
                } disabled:opacity-60`}
              >
                {cargandoAccion ? '...' : participando ? '✓ Participando' : 'Participar'}
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-violet-50 rounded-lg px-3 py-2">
              <span>📅</span>
              <div>
                <div className="font-medium capitalize">{diaCompleto}</div>
                <div className="text-xs text-gray-400">{hora} hrs</div>
              </div>
            </div>
            {evento.lugar && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-violet-50 rounded-lg px-3 py-2">
                <span>📍</span>
                <span>{evento.lugar}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-violet-50 rounded-lg px-3 py-2">
              <span>👤</span>
              <span>Organizado por {evento.creador_nombre}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Participantes */}
        <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-5">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>👥</span> Participantes ({evento.participantes.length})
          </h2>
          <div className="space-y-2">
            {evento.participantes.length === 0 ? (
              <p className="text-gray-400 text-sm">Nadie aún</p>
            ) : (
              evento.participantes.map((p) => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {p.nombre[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{p.nombre}</div>
                    <div className="text-xs text-gray-400">{p.email}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Listas */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-violet-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <span>📋</span> Listas ({evento.listas.length})
            </h2>
            {sesion && (
              <button
                onClick={() => setMostrarFormLista(!mostrarFormLista)}
                className="text-sm text-violet-700 font-medium hover:underline"
              >
                {mostrarFormLista ? 'Cancelar' : '+ Nueva lista'}
              </button>
            )}
          </div>

          {mostrarFormLista && (
            <div className="bg-violet-50 rounded-xl p-4 mb-4 space-y-3">
              <input
                type="text"
                value={nuevaLista.nombre}
                onChange={(e) => setNuevaLista((p) => ({ ...p, nombre: e.target.value }))}
                placeholder="Nombre de la lista"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
              />
              <input
                type="text"
                value={nuevaLista.descripcion}
                onChange={(e) => setNuevaLista((p) => ({ ...p, descripcion: e.target.value }))}
                placeholder="Descripción (opcional)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
              />
              <button
                onClick={crearLista}
                className="bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-violet-800 transition-colors"
              >
                Crear lista
              </button>
            </div>
          )}

          {evento.listas.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay listas aún. ¡Crea una para coordinar!</p>
          ) : (
            <div className="space-y-3">
              {evento.listas.map((lista) => (
                <Link
                  key={lista.id}
                  href={`/eventos/${id}/listas/${lista.id}`}
                  className="block bg-gray-50 hover:bg-violet-50 rounded-xl p-4 transition-colors border border-gray-100 hover:border-violet-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-800">{lista.nombre}</div>
                      {lista.descripcion && (
                        <div className="text-xs text-gray-500 mt-0.5">{lista.descripcion}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">por {lista.creador_nombre}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-violet-700">
                        {lista.articulos_completados}/{lista.total_articulos}
                      </div>
                      <div className="text-xs text-gray-400">completados</div>
                      {Number(lista.total_articulos) > 0 && (
                        <div className="mt-1 w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full transition-all"
                            style={{ width: `${(Number(lista.articulos_completados) / Number(lista.total_articulos)) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
