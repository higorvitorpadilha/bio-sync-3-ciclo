import { Link } from 'react-router-dom';
import { CalendarCheck, MapPinned, Recycle, ShieldCheck } from 'lucide-react';
import { ROUTES } from '../../routes/appRoutes.js';

export default function Home() {
  const featureCards = [
    {
      title: 'Pontos de descarte',
      text: 'Veja pontos aprovados no Firestore, filtre por cidade e material e localize no mapa.',
      icon: MapPinned,
      to: ROUTES.points,
    },
    {
      title: 'Agendamentos reais',
      text: 'Crie pedidos de coleta, aceite como catador e acompanhe o historico de status.',
      icon: CalendarCheck,
      to: ROUTES.appointments,
    },
    {
      title: 'Cadastro validado',
      text: 'Separe doadores, catadores, pontos e administradores com regras claras.',
      icon: ShieldCheck,
      to: ROUTES.register,
    },
  ];

  const causes = [
    { name: 'IBAMA', logo: '/ibamacausa.png', url: 'https://www.gov.br/ibama/pt-br' },
    { name: 'Ecobarreira', logo: '/ecobarreira.png', url: 'https://www.ecobarreira.com.br/' },
    { name: 'SOS Amazonia', logo: '/SOS-Amazonia-logo.png', url: 'https://sosamazonia.org.br/' },
  ];

  return (
    <main>
      <section
        className="bg-cover bg-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(21, 128, 61, 0.94), rgba(15, 23, 42, 0.78)), url('/back-header-map-V3.jpg')",
        }}
      >
        <div className="mx-auto grid min-h-[540px] max-w-7xl content-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
              <Recycle size={16} />
              Sustentabilidade com dados reais
            </div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-normal sm:text-5xl">
              BioSync conecta descarte, coleta e impacto ambiental.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-white/85">
              Cadastre pontos de descarte, encontre locais no mapa e transforme pedidos de coleta em um fluxo rastreavel para doadores, catadores e administradores.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={ROUTES.points} className="rounded-md bg-white px-4 py-3 font-bold text-green-800 hover:bg-slate-100">
                Ver mapa
              </Link>
              <Link to={ROUTES.appointments} className="rounded-md border border-white/60 px-4 py-3 font-bold text-white hover:bg-white/15">
                Agendar coleta
              </Link>
            </div>
          </div>
          <div className="grid content-end gap-3">
            {featureCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.title} to={card.to} className="rounded-md bg-white/95 p-4 text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-white">
                  <div className="flex gap-3">
                    <Icon className="mt-1 text-green-700" size={24} />
                    <div>
                      <h2 className="font-bold">{card.title}</h2>
                      <p className="mt-1 text-sm text-slate-600">{card.text}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-950">Causas ambientais</h2>
          <p className="mt-1 text-slate-600">Links reais para consulta durante a apresentacao.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {causes.map((cause) => (
            <a key={cause.name} href={cause.url} target="_blank" rel="noreferrer" className="rounded-md border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5">
              <img src={cause.logo} alt={cause.name} className="mx-auto h-24 w-24 object-contain" />
              <h3 className="mt-4 font-bold text-slate-900">{cause.name}</h3>
              <p className="mt-1 text-sm text-slate-600">Causa ambiental com link funcional.</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
