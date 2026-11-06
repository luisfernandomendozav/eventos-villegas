import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { obtenerSesion } from '@/lib/auth';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sesion = await obtenerSesion();
  if (!sesion) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { id } = await params;
  const existente = await sql`
    SELECT id FROM participantes WHERE evento_id = ${id} AND usuario_id = ${sesion.id}
  `;

  if (existente.length > 0) {
    return NextResponse.json({ error: 'Ya estás participando en este evento' }, { status: 409 });
  }

  const [participante] = await sql`
    INSERT INTO participantes (evento_id, usuario_id, estado)
    VALUES (${id}, ${sesion.id}, 'confirmado')
    RETURNING *
  `;

  return NextResponse.json(participante, { status: 201 });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sesion = await obtenerSesion();
  if (!sesion) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { id } = await params;
  await sql`
    DELETE FROM participantes WHERE evento_id = ${id} AND usuario_id = ${sesion.id}
  `;

  return NextResponse.json({ ok: true });
}
