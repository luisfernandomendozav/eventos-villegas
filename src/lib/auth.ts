import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE = 'ev_session';

export interface Sesion {
  id: string;
  nombre: string;
  email: string;
}

export async function crearToken(sesion: Sesion) {
  return new SignJWT(sesion as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verificarToken(token: string): Promise<Sesion | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as Sesion;
  } catch {
    return null;
  }
}

export async function obtenerSesion(): Promise<Sesion | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  return verificarToken(token);
}

export async function guardarSesion(sesion: Sesion) {
  const token = await crearToken(sesion);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function cerrarSesion() {
  const store = await cookies();
  store.delete(COOKIE);
}
