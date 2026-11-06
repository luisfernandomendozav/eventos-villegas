import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 text-center">
      <div className="mb-8 text-7xl">🎉</div>
      <h1 className="text-5xl font-extrabold text-violet-900 mb-4">
        Eventos Villegas
      </h1>
      <p className="text-xl text-violet-600 mb-10 max-w-xl mx-auto">
        Organiza eventos increíbles, invita a tus amigos y coordina todo con listas compartidas.
      </p>
      <div className="flex justify-center gap-4 flex-wrap">
        <Link
          href="/eventos"
          className="bg-violet-700 text-white font-semibold px-8 py-3 rounded-xl hover:bg-violet-800 transition-colors text-lg shadow-md"
        >
          Ver eventos
        </Link>
        <Link
          href="/registro"
          className="bg-white text-violet-700 font-semibold px-8 py-3 rounded-xl hover:bg-violet-50 transition-colors text-lg shadow-md border border-violet-200"
        >
          Crear cuenta
        </Link>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-violet-100">
          <div className="text-4xl mb-3">📅</div>
          <h3 className="font-bold text-gray-800 text-lg mb-2">Crea eventos</h3>
          <p className="text-gray-500 text-sm">Organiza reuniones, fiestas, o cualquier tipo de evento con todos los detalles.</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-violet-100">
          <div className="text-4xl mb-3">👥</div>
          <h3 className="font-bold text-gray-800 text-lg mb-2">Invita a todos</h3>
          <p className="text-gray-500 text-sm">Los usuarios pueden unirse a tus eventos y confirmar su participación fácilmente.</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-violet-100">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="font-bold text-gray-800 text-lg mb-2">Coordina con listas</h3>
          <p className="text-gray-500 text-sm">Crea listas de artículos y asígnalos a los participantes para que todos colaboren.</p>
        </div>
      </div>
    </div>
  );
}
