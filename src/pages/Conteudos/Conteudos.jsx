import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, LoadingState, PageShell } from '../../components/Ui.jsx';
import { listContent } from '../../services/biosyncService.js';
import { ROUTES } from '../../routes/appRoutes.js';

export default function Conteudos() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listContent('content')
      .then(setArticles)
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell title="Conteudos" subtitle="Artigos carregados do Firestore ou do seed local de demonstracao.">
      {loading ? (
        <LoadingState />
      ) : articles.length === 0 ? (
        <EmptyState title="Nenhum conteudo publicado" description="Cadastre conteudos no Firestore ou rode o seed." />
      ) : (
        <div className="grid gap-5">
          {articles.map((article) => (
            <article key={article.id} className="grid gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[160px_1fr]">
              <img src={article.imageUrl || '/cardNoticias.jpg'} alt="" className="h-36 w-full rounded-md object-cover sm:h-full" />
              <div>
                <h2 className="text-xl font-bold text-slate-950">{article.title}</h2>
                <p className="mt-2 text-slate-600">{article.excerpt}</p>
                <Link to={`${ROUTES.content}/${article.slug}`} className="mt-4 inline-flex rounded-md bg-green-700 px-3 py-2 text-sm font-bold text-white hover:bg-green-800">
                  Ler mais
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
