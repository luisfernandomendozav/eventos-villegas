import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { obtenerSesion } from '@/lib/auth';

type Params = { params: Promise<{ id: string; listaId: string; articuloId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const sesion = await obtenerSesion();
  if (!sesion) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { articuloId } = await params;
  const body = await req.json();

  const campos: Record<string, unknown> = {};
  if ('completado' in body) campos.completado = body.completado;
  if ('asignado_a' in body) campos.asignado_a = body.asignado_a;
  if ('nombre' in body) campos.nombre = body.nombre;
  if ('cantidad' in body) campos.cantidad = body.cantidad;
  if ('descripcion' in body) campos.descripcion = body.descripcion;

  if (Object.keys(campos).length === 0) {
    return NextResponse.json({ error: 'Sin campos para actualizar' }, { status: 400 });
  }

  if ('completado' in campos && !('asignado_a' in campos) && !('nombre' in campos)) {
    const [articulo] = await sql`
      UPDATE articulos SET completado = ${campos.completado as boolean}
      WHERE id = ${articuloId}
      RETURNING *
    `;
    return NextResponse.json(articulo);
  }

  if ('asignado_a' in campos) {
    const asignado = campos.asignado_a === null ? null : (campos.asignado_a as string);
    const [articulo] = await sql`
      UPDATE articulos SET asignado_a = ${asignado}
      WHERE id = ${articuloId}
      RETURNING *
    `;
    return NextResponse.json(articulo);
  }

  const [articulo] = await sql`
    UPDATE articulos
    SET nombre = COALESCE(${campos.nombre as string || null}, nombre),
        descripcion = COALESCE(${campos.descripcion as string || null}, descripcion),
        cantidad = COALESCE(${campos.cantidad as number || null}, cantidad)
    WHERE id = ${articuloId}
    RETURNING *
  `;

  return NextResponse.json(articulo);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const sesion = await obtenerSesion();
  if (!sesion) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { articuloId } = await params;
  await sql`DELETE FROM articulos WHERE id = ${articuloId}`;
  return NextResponse.json({ ok: true });
}
