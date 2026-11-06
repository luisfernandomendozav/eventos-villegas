import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { obtenerSesion } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const sesion = await obtenerSesion();
  if (!sesion) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const eventoId = searchParams.get('evento_id');

  if (eventoId) {
    const usuarios = await sql`
      SELECT u.id, u.nombre, u.email, u.avatar_url
      FROM usuarios u
      JOIN participantes p ON u.id = p.usuario_id
      WHERE p.evento_id = ${eventoId} AND p.estado = 'confirmado'
      ORDER BY u.nombre ASC
    `;
    return NextResponse.json(usuarios);
  }

  return NextResponse.json([]);
}
