import { Link } from 'react-router-dom';
import { MapPin, Recycle, UserRound } from 'lucide-react';
import { ROUTES } from '../../routes/appRoutes.js';

export default function ButtonsUserRegister() {
  const cards = [
    {
      title: 'Doador ou catador',
      description: 'Crie uma conta para solicitar coleta, aceitar pedidos ou acompanhar historico.',
      to: ROUTES.userRegister,
      icon: UserRound,
      image: '/undraw_throw_away_trash_x60k.svg',
    },
    {
      title: 'Ponto de descarte',
      description: 'Cadastre residencia, comercio ou cooperativa para aparecer no mapa apos validacao.',
      to: ROUTES.pointRegister,
      icon: MapPin,
      image: '/undraw_collecting_re_lp6p.svg',
    },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
          <Recycle size={16} />
          Cadastro BioSync
        </div>
        <h1 className="text-3xl font-bold text-slate-950">Escolha o tipo de cadastro</h1>
        <p className="mt-2 text-slate-600">
          Cada perfil tem regras e permissoes proprias para proteger os dados e deixar a apresentacao mais consistente.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.to} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <img src={card.image} alt="" className="mx-auto h-44 object-contain" />
              <div className="mt-6 flex items-start gap-3">
                <Icon className="mt-1 text-green-700" size={24} />
                <div>
                  <h2 className="text-xl font-bold text-slate-950">{card.title}</h2>
                  <p className="mt-2 text-slate-600">{card.description}</p>
                  <span className="mt-4 inline-flex rounded-md bg-green-700 px-4 py-2 text-sm font-bold text-white">
                    Comecar cadastro
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
