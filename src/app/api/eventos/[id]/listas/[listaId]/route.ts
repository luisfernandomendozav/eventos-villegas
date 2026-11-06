import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { obtenerSesion } from '@/lib/auth';

type Params = { params: Promise<{ id: string; listaId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { listaId } = await params;

  const [lista] = await sql`
    SELECT l.*, u.nombre as creador_nombre
    FROM listas l
    JOIN usuarios u ON l.creador_id = u.id
    WHERE l.id = ${listaId}
  `;

  if (!lista) return NextResponse.json({ error: 'Lista no encontrada' }, { status: 404 });

  const articulos = await sql`
    SELECT a.*, u.nombre as asignado_nombre, u.email as asignado_email
    FROM articulos a
    LEFT JOIN usuarios u ON a.asignado_a = u.id
    WHERE a.lista_id = ${listaId}
    ORDER BY a.creado_en ASC
  `;

  return NextResponse.json({ ...lista, articulos });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const sesion = await obtenerSesion();
  if (!sesion) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { listaId } = await params;
  const [lista] = await sql`SELECT creador_id FROM listas WHERE id = ${listaId}`;
  if (!lista) return NextResponse.json({ error: 'Lista no encontrada' }, { status: 404 });
  if (lista.creador_id !== sesion.id) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });

  await sql`DELETE FROM listas WHERE id = ${listaId}`;
  return NextResponse.json({ ok: true });
}
