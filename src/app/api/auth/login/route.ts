import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';
import { guardarSesion } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, contrasena } = await req.json();

  if (!email || !contrasena) {
    return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
  }

  const [usuario] = await sql`SELECT * FROM usuarios WHERE email = ${email}`;
  if (!usuario) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
  }

  const valido = await bcrypt.compare(contrasena, usuario.contrasena_hash);
  if (!valido) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
  }

  await guardarSesion({ id: usuario.id, nombre: usuario.nombre, email: usuario.email });
  return NextResponse.json({ ok: true, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } });
}
