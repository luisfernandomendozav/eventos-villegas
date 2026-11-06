import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { obtenerSesion } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [evento] = await sql`
    SELECT e.*, u.nombre as creador_nombre, u.email as creador_email
    FROM eventos e
    JOIN usuarios u ON e.creador_id = u.id
    WHERE e.id = ${id}
  `;

  if (!evento) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });

  const participantes = await sql`
    SELECT p.*, u.nombre, u.email, u.avatar_url
    FROM participantes p
    JOIN usuarios u ON p.usuario_id = u.id
    WHERE p.evento_id = ${id}
    ORDER BY p.unido_en ASC
  `;

  const listas = await sql`
    SELECT l.*, u.nombre as creador_nombre,
      COUNT(a.id) as total_articulos,
      COUNT(a.id) FILTER (WHERE a.completado) as articulos_completados
    FROM listas l
    JOIN usuarios u ON l.creador_id = u.id
    LEFT JOIN articulos a ON l.id = a.lista_id
    WHERE l.evento_id = ${id}
    GROUP BY l.id, u.nombre
    ORDER BY l.creado_en ASC
  `;

  return NextResponse.json({ ...evento, participantes, listas });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sesion = await obtenerSesion();
  if (!sesion) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { id } = await params;
  const [evento] = await sql`SELECT creador_id FROM eventos WHERE id = ${id}`;
  if (!evento) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
  if (evento.creador_id !== sesion.id) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });

  await sql`DELETE FROM eventos WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
