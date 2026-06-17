import React, { useEffect, useState } from 'react';
import { Alert, LoadingState, PageShell, StatusBadge } from '../../components/Ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  getDashboardStats,
  listDisposalPoints,
  updateDisposalPointStatus,
} from '../../services/biosyncService.js';

export default function Admin() {
  const { user } = useAuth();
  const [points, setPoints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    const [pointDocs, dashboardStats] = await Promise.all([
      listDisposalPoints({ includePending: true }),
      getDashboardStats(),
    ]);
    setPoints(pointDocs);
    setStats(dashboardStats);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (id, status) => {
    await updateDisposalPointStatus(id, status);
    setMessage(`Ponto marcado como ${status}.`);
    await load();
  };

  if (user?.role !== 'admin') {
    return (
      <PageShell title="Admin">
        <Alert type="warning">Apenas administradores podem aprovar pontos. No modo demo, entre com admin@biosync.local.</Alert>
      </PageShell>
    );
  }

  return (
    <PageShell title="Painel administrativo" subtitle="Valide pontos de descarte e acompanhe indicadores principais.">
      {loading ? (
        <LoadingState />
      ) : (
        <div className="space-y-6">
          {message && <Alert type="success">{message}</Alert>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ['Pontos', stats.totalPoints],
              ['Pendentes', stats.pendingPoints],
              ['Coletas abertas', stats.openRequests],
              ['Concluidas', stats.completedRequests],
              ['Usuarios', stats.users],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">{label}</p>
                <p className="mt-1 text-3xl font-bold text-slate-950">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4">
            {points.map((point) => (
              <article key={point.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">{point.name}</h2>
                    <p className="text-sm text-slate-600">
                      {point.address} - {point.city}/{point.state}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">{point.materials?.join(', ')}</p>
                  </div>
                  <StatusBadge status={point.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => changeStatus(point.id, 'approved')} className="rounded-md bg-green-700 px-3 py-2 text-sm font-bold text-white hover:bg-green-800">
                    Aprovar
                  </button>
                  <button onClick={() => changeStatus(point.id, 'rejected')} className="rounded-md bg-red-700 px-3 py-2 text-sm font-bold text-white hover:bg-red-800">
                    Reprovar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}
