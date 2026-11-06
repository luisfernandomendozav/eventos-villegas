import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';
import { guardarSesion } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { nombre, email, contrasena } = await req.json();

  if (!nombre || !email || !contrasena) {
    return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
  }

  const existente = await sql`SELECT id FROM usuarios WHERE email = ${email}`;
  if (existente.length > 0) {
    return NextResponse.json({ error: 'Ya existe una cuenta con ese correo' }, { status: 409 });
  }

  const hash = await bcrypt.hash(contrasena, 12);
  const [usuario] = await sql`
    INSERT INTO usuarios (nombre, email, contrasena_hash)
    VALUES (${nombre}, ${email}, ${hash})
    RETURNING id, nombre, email
  `;

  await guardarSesion({ id: usuario.id, nombre: usuario.nombre, email: usuario.email });
  return NextResponse.json({ ok: true, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } });
}
