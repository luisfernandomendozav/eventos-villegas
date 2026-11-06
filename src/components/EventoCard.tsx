'use client';

import Link from 'next/link';

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

export default function EventoCard({ evento }: { evento: Evento }) {
  const fecha = new Date(evento.fecha);
  const dia = fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  const hora = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  return (
    <Link href={`/eventos/${evento.id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
        <div className="h-36 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center overflow-hidden">
          {evento.imagen_url ? (
            <img src={evento.imagen_url} alt={evento.titulo} className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl">🎉</span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-violet-700 transition-colors line-clamp-1">
            {evento.titulo}
          </h3>
          {evento.descripcion && (
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{evento.descripcion}</p>
          )}
          <div className="mt-3 space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <span>📅</span>
              <span>{dia} · {hora}</span>
            </div>
            {evento.lugar && (
              <div className="flex items-center gap-1.5">
                <span>📍</span>
                <span className="line-clamp-1">{evento.lugar}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span>👥</span>
              <span>{evento.total_participantes} participante{evento.total_participantes !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
            Creado por {evento.creador_nombre}
          </div>
        </div>
      </div>
    </Link>
  );
}
