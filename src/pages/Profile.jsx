import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, PageShell } from '../components/Ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { brazilianStates, roleLabels } from '../data/demoData.js';
import { saveUserProfile } from '../services/biosyncService.js';
import { ROUTES } from '../routes/appRoutes.js';

export default function Profile() {
  const { user, isAuthenticated, refreshProfile } = useAuth();
  const [form, setForm] = useState({ displayName: '', phone: '', city: '', state: 'SP' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        displayName: user.displayName || '',
        phone: user.phone || '',
        city: user.city || '',
        state: user.state || 'SP',
      });
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <PageShell title="Perfil">
        <Alert type="warning">
          Faca login ou crie uma conta para atualizar seus dados. No modo demo, use doador@biosync.local, catador@biosync.local ou admin@biosync.local.
        </Alert>
        <Link to={ROUTES.register} className="mt-4 inline-flex rounded-md bg-green-700 px-4 py-2 font-bold text-white">
          Criar cadastro
        </Link>
      </PageShell>
    );
  }

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);
    try {
      await saveUserProfile(user.uid, {
        ...user,
        ...form,
        email: user.email,
        role: user.role || 'donor',
      });
      await refreshProfile();
      setMessage('Perfil atualizado.');
    } catch (err) {
      setError('Nao foi possivel atualizar o perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="Perfil" subtitle={`Perfil atual: ${roleLabels[user.role] || user.role}`}>
      <form onSubmit={handleSubmit} className="max-w-3xl rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nome" id="profile-name">
            <input id="profile-name" className="form-input" value={form.displayName} onChange={(e) => updateField('displayName', e.target.value)} />
          </Field>
          <Field label="E-mail" id="profile-email">
            <input id="profile-email" className="form-input bg-slate-100" value={user.email || ''} disabled />
          </Field>
          <Field label="Celular" id="profile-phone">
            <input id="profile-phone" className="form-input" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
          </Field>
          <Field label="Cidade" id="profile-city">
            <input id="profile-city" className="form-input" value={form.city} onChange={(e) => updateField('city', e.target.value)} />
          </Field>
          <Field label="Estado" id="profile-state">
            <select id="profile-state" className="form-input" value={form.state} onChange={(e) => updateField('state', e.target.value)}>
              {brazilianStates.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-5 space-y-3">
          {message && <Alert type="success">{message}</Alert>}
          {error && <Alert type="error">{error}</Alert>}
        </div>
        <button disabled={saving} className="mt-6 rounded-md bg-green-700 px-4 py-2 font-bold text-white hover:bg-green-800 disabled:opacity-70">
          {saving ? 'Salvando...' : 'Salvar alteracoes'}
        </button>
      </form>
    </PageShell>
  );
}

function Field({ label, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}
