import React, { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, CheckCircle2, Search } from 'lucide-react';
import { Alert, EmptyState, LoadingState, PageShell, StatusBadge } from '../../components/Ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { brazilianStates, materialOptions } from '../../data/demoData.js';
import {
  assignPickupRequest,
  completePickupRequest,
  createPickupRequest,
  listPickupRequests,
} from '../../services/biosyncService.js';

const initialForm = {
  materials: [],
  quantity: '',
  address: '',
  city: '',
  state: 'SP',
  preferredDate: '',
  notes: '',
};

export default function Agendamentos() {
  const { user, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', city: '', status: '' });
  const [form, setForm] = useState(initialForm);

  const loadRequests = async () => {
    setLoading(true);
    const data = await listPickupRequests();
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const cities = useMemo(() => [...new Set(requests.map((request) => request.city))].sort(), [requests]);

  const filteredRequests = useMemo(() => {
    const search = filters.search.toLowerCase();
    return requests.filter((request) => {
      const matchesSearch =
        !search ||
        request.donorName?.toLowerCase().includes(search) ||
        request.address?.toLowerCase().includes(search) ||
        request.materials?.join(' ').toLowerCase().includes(search);
      const matchesCity = !filters.city || request.city === filters.city;
      const matchesStatus = !filters.status || request.status === filters.status;
      return matchesSearch && matchesCity && matchesStatus;
    });
  }, [filters, requests]);

  const toggleMaterial = (material) => {
    setForm((current) => ({
      ...current,
      materials: current.materials.includes(material)
        ? current.materials.filter((item) => item !== material)
        : [...current.materials, material],
    }));
  };

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (form.materials.length === 0 || !form.quantity.trim() || !form.address.trim() || !form.city.trim() || !form.preferredDate) {
      setError('Preencha materiais, quantidade, endereco, cidade e data preferida.');
      return;
    }

    setSaving(true);
    try {
      await createPickupRequest(
        {
          materials: form.materials,
          quantity: form.quantity.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state,
          preferredDates: [new Date(form.preferredDate).toISOString()],
          notes: form.notes.trim(),
        },
        user
      );
      setForm(initialForm);
      setMessage('Solicitacao criada e disponivel para catadores.');
      await loadRequests();
    } catch (err) {
      setError('Nao foi possivel criar a solicitacao. Confira o Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async (request) => {
    setMessage('');
    setError('');
    try {
      await assignPickupRequest(request.id, user?.uid || 'demo-collector');
      setMessage('Coleta aceita pelo catador.');
      await loadRequests();
    } catch (err) {
      setError('Nao foi possivel aceitar a coleta.');
    }
  };

  const handleComplete = async (request) => {
    setMessage('');
    setError('');
    try {
      await completePickupRequest(request.id);
      setMessage('Coleta marcada como concluida.');
      await loadRequests();
    } catch (err) {
      setError('Nao foi possivel concluir a coleta.');
    }
  };

  return (
    <PageShell
      title="Agendamentos de coleta"
      subtitle="Fluxo real de solicitacao, aceite e conclusao. Com Firestore configurado, cada acao grava no backend."
    >
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <CalendarPlus className="text-green-700" />
            <h2 className="text-xl font-bold text-slate-950">Nova solicitacao</h2>
          </div>
          {!isAuthenticated && (
            <Alert type="warning">
              Voce esta em modo visitante/demo. Para producao, faca login antes de criar solicitacoes.
            </Alert>
          )}

          <fieldset className="mt-4">
            <legend className="mb-2 text-sm font-semibold text-slate-700">Materiais</legend>
            <div className="flex flex-wrap gap-2">
              {materialOptions.map((material) => (
                <label key={material} className={`cursor-pointer rounded-full border px-3 py-2 text-sm font-semibold ${form.materials.includes(material) ? 'border-green-700 bg-green-100 text-green-800' : 'border-slate-300 bg-white text-slate-700'}`}>
                  <input type="checkbox" className="sr-only" checked={form.materials.includes(material)} onChange={() => toggleMaterial(material)} />
                  {material}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-4 grid gap-3">
            <input className="form-input" placeholder="Quantidade estimada" value={form.quantity} onChange={(e) => updateForm('quantity', e.target.value)} />
            <input className="form-input" placeholder="Endereco da coleta" value={form.address} onChange={(e) => updateForm('address', e.target.value)} />
            <div className="grid grid-cols-[1fr_100px] gap-3">
              <input className="form-input" placeholder="Cidade" value={form.city} onChange={(e) => updateForm('city', e.target.value)} />
              <select className="form-input" value={form.state} onChange={(e) => updateForm('state', e.target.value)}>
                {brazilianStates.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
            <input className="form-input" type="datetime-local" value={form.preferredDate} onChange={(e) => updateForm('preferredDate', e.target.value)} />
            <textarea className="form-input min-h-[90px]" placeholder="Observacoes para o catador" value={form.notes} onChange={(e) => updateForm('notes', e.target.value)} />
          </div>

          <div className="mt-4 space-y-3">
            {error && <Alert type="error">{error}</Alert>}
            {message && <Alert type="success">{message}</Alert>}
          </div>

          <button disabled={saving} className="mt-5 w-full rounded-md bg-green-700 px-4 py-3 font-bold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70">
            {saving ? 'Salvando...' : 'Criar solicitacao'}
          </button>
        </form>

        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_160px]">
            <div className="relative">
              <input value={filters.search} onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))} className="form-input pl-9" placeholder="Buscar por material, endereco ou doador" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
            <select value={filters.city} onChange={(e) => setFilters((current) => ({ ...current, city: e.target.value }))} className="form-input">
              <option value="">Todas cidades</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <select value={filters.status} onChange={(e) => setFilters((current) => ({ ...current, status: e.target.value }))} className="form-input">
              <option value="">Todos status</option>
              <option value="open">Aberto</option>
              <option value="assigned">Aceito</option>
              <option value="completed">Concluido</option>
            </select>
          </div>

          {loading ? (
            <LoadingState />
          ) : filteredRequests.length === 0 ? (
            <EmptyState title="Nenhuma coleta encontrada" description="Crie uma solicitacao ou ajuste os filtros." />
          ) : (
            <div className="grid gap-4">
              {filteredRequests.map((request) => (
                <article key={request.id} className="rounded-md border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="font-bold text-slate-950">{request.materials?.join(', ')}</h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {request.quantity} - {request.city}/{request.state}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{request.address}</p>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                  {request.notes && <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700">{request.notes}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {request.status === 'open' && (
                      <button onClick={() => handleAssign(request)} className="rounded-md bg-green-700 px-3 py-2 text-sm font-bold text-white hover:bg-green-800">
                        Aceitar coleta
                      </button>
                    )}
                    {request.status === 'assigned' && (
                      <button onClick={() => handleComplete(request)} className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-2 text-sm font-bold text-white hover:bg-slate-800">
                        <CheckCircle2 size={16} />
                        Concluir
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
