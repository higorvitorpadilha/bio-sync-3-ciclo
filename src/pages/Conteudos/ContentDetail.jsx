import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { EmptyState, LoadingState, PageShell } from '../../components/Ui.jsx';
import { getContentBySlug } from '../../services/biosyncService.js';
import { ROUTES } from '../../routes/appRoutes.js';

export default function ContentDetail({ type = 'content' }) {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const collectionName = type === 'news' ? 'news' : 'content';
  const backRoute = type === 'news' ? ROUTES.news : ROUTES.content;

  useEffect(() => {
    getContentBySlug(collectionName, slug)
      .then(setItem)
      .finally(() => setLoading(false));
  }, [collectionName, slug]);

  if (loading) {
    return (
      <PageShell title="Carregando">
        <LoadingState />
      </PageShell>
    );
  }

  if (!item) {
    return (
      <PageShell title="Conteudo nao encontrado">
        <EmptyState title="Nada encontrado para este link" description="O slug pode ter sido removido ou ainda nao foi publicado." />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={item.title}
      subtitle={item.excerpt}
      actions={
        <Link to={backRoute} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white">
          <ArrowLeft size={16} />
          Voltar
        </Link>
      }
    >
      <article className="mx-auto max-w-3xl rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <img src={item.imageUrl || '/cardNoticias.jpg'} alt="" className="mb-5 max-h-[360px] w-full rounded-md object-cover" />
        <div className="prose max-w-none text-slate-700">
          {String(item.body || '').split('\n').map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </PageShell>
  );
}
