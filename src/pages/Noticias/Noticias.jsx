import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, LoadingState, PageShell } from '../../components/Ui.jsx';
import { listContent } from '../../services/biosyncService.js';
import { ROUTES } from '../../routes/appRoutes.js';

export default function Noticias() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listContent('news')
      .then(setNews)
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell title="Noticias" subtitle="Noticias publicadas com slug unico, evitando botoes que voltam para a mesma pagina.">
      {loading ? (
        <LoadingState />
      ) : news.length === 0 ? (
        <EmptyState title="Nenhuma noticia publicada" description="Cadastre noticias no Firestore ou rode o seed." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {news.map((item) => (
            <article key={item.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <img src={item.imageUrl || '/cardConteudo.jpg'} alt="" className="mb-4 h-44 w-full rounded-md object-cover" />
              <h2 className="text-xl font-bold text-slate-950">{item.title}</h2>
              <p className="mt-2 text-slate-600">{item.excerpt}</p>
              <Link to={`${ROUTES.news}/${item.slug}`} className="mt-4 inline-flex rounded-md bg-green-700 px-3 py-2 text-sm font-bold text-white hover:bg-green-800">
                Ler noticia
              </Link>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
