import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { obtenerSesion } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sesion = await obtenerSesion();
  if (!sesion) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { id } = await params;
  const { nombre, descripcion } = await req.json();

  if (!nombre) return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });

  const [lista] = await sql`
    INSERT INTO listas (evento_id, nombre, descripcion, creador_id)
    VALUES (${id}, ${nombre}, ${descripcion || null}, ${sesion.id})
    RETURNING *
  `;

  return NextResponse.json(lista, { status: 201 });
}
