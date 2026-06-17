import { Link } from 'react-router-dom';
import { EmptyState, PageShell } from '../components/Ui.jsx';
import { ROUTES } from '../routes/appRoutes.js';

export default function NotFound() {
  return (
    <PageShell title="Pagina nao encontrada">
      <EmptyState
        title="Esse link nao existe"
        description="As rotas antigas agora redirecionam automaticamente, mas esta URL nao faz parte do BioSync."
        action={
          <Link to={ROUTES.home} className="rounded-md bg-green-700 px-4 py-2 font-bold text-white hover:bg-green-800">
            Voltar para home
          </Link>
        }
      />
    </PageShell>
  );
}
