import { NextResponse } from 'next/server';
import { obtenerSesion } from '@/lib/auth';

export async function GET() {
  const sesion = await obtenerSesion();
  if (!sesion) return NextResponse.json({ sesion: null });
  return NextResponse.json({ sesion });
}
