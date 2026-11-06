import type { Metadata } from 'next';
import './globals.css';
import { SesionProvider } from '@/context/SesionContext';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Eventos Villegas',
  description: 'Organiza eventos, participa y coordina con tus invitados',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col bg-violet-50">
        <SesionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="bg-violet-700 text-violet-200 text-center text-xs py-4 mt-8">
            © 2024 Eventos Villegas
          </footer>
        </SesionProvider>
      </body>
    </html>
  );
}
