'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSesion } from '@/context/SesionContext';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
}

interface Articulo {
  id: string;
  nombre: string;
  descripcion: string | null;
  cantidad: number;
  asignado_a: string | null;
  asignado_nombre: string | null;
  asignado_email: string | null;
  completado: boolean;
}

interface Lista {
  id: string;
  nombre: string;
  descripcion: string | null;
  creador_id: string;
  creador_nombre: string;
  evento_id: string;
  articulos: Articulo[];
}

export default function DetallaLista() {
  const { id, listaId } = useParams<{ id: string; listaId: string }>();
  const { sesion } = useSesion();
  const router = useRouter();

  const [lista, setLista] = useState<Lista | null>(null);
  const [participantes, setParticipantes] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nuevoArticulo, setNuevoArticulo] = useState({ nombre: '', descripcion: '', cantidad: 1 });
  const [mostrarForm, setMostrarForm] = useState(false);

  const cargar = useCallback(async () => {
    const [resLista, resParticipantes] = await Promise.all([
      fetch(`/api/eventos/${id}/listas/${listaId}`),
      fetch(`/api/usuarios?evento_id=${id}`),
    ]);
    if (!resLista.ok) { router.push(`/eventos/${id}`); return; }
    const [dataLista, dataParticipantes] = await Promise.all([
      resLista.json(),
      resParticipantes.json(),
    ]);
    setLista(dataLista);
    setParticipantes(dataParticipantes);
    setCargando(false);
  }, [id, listaId, router]);

  useEffect(() => { cargar(); }, [cargar]);

  const agregarArticulo = async () => {
    if (!nuevoArticulo.nombre.trim()) return;
    const res = await fetch(`/api/eventos/${id}/listas/${listaId}/articulos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoArticulo),
    });
    if (res.ok) {
      setNuevoArticulo({ nombre: '', descripcion: '', cantidad: 1 });
      setMostrarForm(false);
      await cargar();
    }
  };

  const toggleCompletado = async (articuloId: string, completado: boolean) => {
    await fetch(`/api/eventos/${id}/listas/${listaId}/articulos/${articuloId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completado: !completado }),
    });
    await cargar();
  };

  const asignarArticulo = async (articuloId: string, usuarioId: string | null) => {
    await fetch(`/api/eventos/${id}/listas/${listaId}/articulos/${articuloId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asignado_a: usuarioId }),
    });
    await cargar();
  };

  const eliminarArticulo = async (articuloId: string) => {
    await fetch(`/api/eventos/${id}/listas/${listaId}/articulos/${articuloId}`, {
      method: 'DELETE',
    });
    await cargar();
  };

  const eliminarLista = async () => {
    if (!confirm('¿Eliminar esta lista?')) return;
    await fetch(`/api/eventos/${id}/listas/${listaId}`, { method: 'DELETE' });
    router.push(`/eventos/${id}`);
  };

  if (cargando) return <div className="text-center py-20 text-gray-400">Cargando lista...</div>;
  if (!lista) return null;

  const completados = lista.articulos.filter((a) => a.completado).length;
  const total = lista.articulos.length;
  const progreso = total > 0 ? Math.round((completados / total) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href={`/eventos/${id}`} className="text-violet-600 text-sm hover:underline">
        ← Volver al evento
      </Link>

      <div className="mt-4 bg-white rounded-2xl shadow-sm border border-violet-100 p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-violet-900">{lista.nombre}</h1>
            {lista.descripcion && <p className="text-gray-500 text-sm mt-1">{lista.descripcion}</p>}
            <p className="text-xs text-gray-400 mt-1">Creada por {lista.creador_nombre}</p>
          </div>
          {sesion?.id === lista.creador_id && (
            <button
              onClick={eliminarLista}
              className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Eliminar lista
            </button>
          )}
        </div>

        {total > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{completados} de {total} completados</span>
              <span>{progreso}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all duration-300"
                style={{ width: `${progreso}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Artículos */}
      <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">Artículos ({total})</h2>
          {sesion && (
            <button
              onClick={() => setMostrarForm(!mostrarForm)}
              className="text-sm text-violet-700 font-medium hover:underline"
            >
              {mostrarForm ? 'Cancelar' : '+ Agregar artículo'}
            </button>
          )}
        </div>

        {mostrarForm && (
          <div className="bg-violet-50 rounded-xl p-4 mb-4 space-y-3">
            <input
              type="text"
              value={nuevoArticulo.nombre}
              onChange={(e) => setNuevoArticulo((p) => ({ ...p, nombre: e.target.value }))}
              placeholder="Nombre del artículo"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
            />
            <input
              type="text"
              value={nuevoArticulo.descripcion}
              onChange={(e) => setNuevoArticulo((p) => ({ ...p, descripcion: e.target.value }))}
              placeholder="Descripción (opcional)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
            />
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">Cantidad:</label>
              <input
                type="number"
                min={1}
                value={nuevoArticulo.cantidad}
                onChange={(e) => setNuevoArticulo((p) => ({ ...p, cantidad: Number(e.target.value) }))}
                className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
              />
            </div>
            <button
              onClick={agregarArticulo}
              className="bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-violet-800 transition-colors"
            >
              Agregar
            </button>
          </div>
        )}

        {lista.articulos.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">No hay artículos. ¡Agrega el primero!</p>
        ) : (
          <div className="space-y-3">
            {lista.articulos.map((articulo) => (
              <div
                key={articulo.id}
                className={`rounded-xl p-4 border transition-all ${
                  articulo.completado ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleCompletado(articulo.id, articulo.completado)}
                    className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
                      articulo.completado
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-violet-500'
                    }`}
                  >
                    {articulo.completado && <span className="text-xs">✓</span>}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm ${articulo.completado ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {articulo.nombre}
                      {articulo.cantidad > 1 && (
                        <span className="ml-2 text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded">
                          ×{articulo.cantidad}
                        </span>
                      )}
                    </div>
                    {articulo.descripcion && (
                      <div className="text-xs text-gray-500 mt-0.5">{articulo.descripcion}</div>
                    )}

                    {/* Asignación */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-500">Asignado a:</span>
                      <select
                        value={articulo.asignado_a || ''}
                        onChange={(e) => asignarArticulo(articulo.id, e.target.value || null)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-400 bg-white max-w-[160px]"
                        disabled={!sesion}
                      >
                        <option value="">Sin asignar</option>
                        {participantes.map((u) => (
                          <option key={u.id} value={u.id}>{u.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {sesion && (
                    <button
                      onClick={() => eliminarArticulo(articulo.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 text-lg leading-none"
                      title="Eliminar"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
