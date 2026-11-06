import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { obtenerSesion } from '@/lib/auth';

type Params = { params: Promise<{ id: string; listaId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const sesion = await obtenerSesion();
  if (!sesion) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { listaId } = await params;
  const { nombre, descripcion, cantidad } = await req.json();

  if (!nombre) return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });

  const [articulo] = await sql`
    INSERT INTO articulos (lista_id, nombre, descripcion, cantidad)
    VALUES (${listaId}, ${nombre}, ${descripcion || null}, ${cantidad || 1})
    RETURNING *
  `;

  return NextResponse.json(articulo, { status: 201 });
}
