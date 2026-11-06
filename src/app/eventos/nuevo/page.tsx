'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NuevoEvento() {
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    lugar: '',
    imagen_url: '',
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const cambio = (campo: string, valor: string) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    const res = await fetch('/api/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setCargando(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    router.push(`/eventos/${data.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/eventos" className="text-violet-600 text-sm hover:underline">
          ← Volver a eventos
        </Link>
        <h1 className="text-3xl font-extrabold text-violet-900 mt-2">Crear evento</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={enviar} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.titulo}
              onChange={(e) => cambio('titulo', e.target.value)}
              placeholder="Nombre del evento"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => cambio('descripcion', e.target.value)}
              placeholder="Cuéntales más sobre el evento..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha y hora <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={form.fecha}
              onChange={(e) => cambio('fecha', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lugar</label>
            <input
              type="text"
              value={form.lugar}
              onChange={(e) => cambio('lugar', e.target.value)}
              placeholder="¿Dónde será el evento?"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de imagen (opcional)</label>
            <input
              type="url"
              value={form.imagen_url}
              onChange={(e) => cambio('imagen_url', e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={cargando}
              className="flex-1 bg-violet-700 text-white font-semibold py-2.5 rounded-lg hover:bg-violet-800 disabled:opacity-60 transition-colors"
            >
              {cargando ? 'Creando...' : 'Crear evento'}
            </button>
            <Link
              href="/eventos"
              className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
