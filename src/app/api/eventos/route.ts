import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { obtenerSesion } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const buscar = searchParams.get('q') || '';

  const eventos = await sql`
    SELECT e.*, u.nombre as creador_nombre,
      COUNT(DISTINCT p.id) as total_participantes
    FROM eventos e
    JOIN usuarios u ON e.creador_id = u.id
    LEFT JOIN participantes p ON e.id = p.evento_id AND p.estado = 'confirmado'
    WHERE e.titulo ILIKE ${'%' + buscar + '%'}
       OR e.descripcion ILIKE ${'%' + buscar + '%'}
    GROUP BY e.id, u.nombre
    ORDER BY e.fecha ASC
  `;

  return NextResponse.json(eventos);
}

export async function POST(req: NextRequest) {
  const sesion = await obtenerSesion();
  if (!sesion) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { titulo, descripcion, fecha, lugar, imagen_url } = await req.json();
  if (!titulo || !fecha) {
    return NextResponse.json({ error: 'Título y fecha son requeridos' }, { status: 400 });
  }

  const [evento] = await sql`
    INSERT INTO eventos (titulo, descripcion, fecha, lugar, imagen_url, creador_id)
    VALUES (${titulo}, ${descripcion || null}, ${fecha}, ${lugar || null}, ${imagen_url || null}, ${sesion.id})
    RETURNING *
  `;

  await sql`
    INSERT INTO participantes (evento_id, usuario_id, estado)
    VALUES (${evento.id}, ${sesion.id}, 'confirmado')
  `;

  return NextResponse.json(evento, { status: 201 });
}
