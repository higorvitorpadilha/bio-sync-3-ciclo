import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, PageShell } from '../../components/Ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { brazilianStates, materialOptions } from '../../data/demoData.js';
import { createDisposalPoint } from '../../services/biosyncService.js';
import { ROUTES } from '../../routes/appRoutes.js';

const initialForm = {
  name: '',
  address: '',
  city: '',
  state: 'SP',
  neighborhood: '',
  lat: '',
  lng: '',
  openingHours: '',
  imageUrl: '',
  materials: [],
};

export default function DropPointsRegister() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const toggleMaterial = (material) => {
    setForm((current) => ({
      ...current,
      materials: current.materials.includes(material)
        ? current.materials.filter((item) => item !== material)
        : [...current.materials, material],
    }));
  };

  const validate = () => {
    if (!form.name.trim() || !form.address.trim() || !form.city.trim() || !form.neighborhood.trim()) {
      return 'Preencha nome, endereco, cidade e bairro.';
    }
    if (form.materials.length === 0) return 'Selecione pelo menos um material aceito.';
    if (!form.openingHours.trim()) return 'Informe o horario de funcionamento.';
    if (form.lat && Number.isNaN(Number(form.lat))) return 'Latitude invalida.';
    if (form.lng && Number.isNaN(Number(form.lng))) return 'Longitude invalida.';
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await createDisposalPoint(
        {
          name: form.name.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state,
          neighborhood: form.neighborhood.trim(),
          geo: form.lat && form.lng ? { lat: Number(form.lat), lng: Number(form.lng) } : null,
          materials: form.materials,
          openingHours: form.openingHours.trim(),
          imageUrl: form.imageUrl.trim() || '/PontoDescarte.png',
        },
        user?.uid || 'anonymous'
      );
      setSuccess('Ponto enviado para validacao. Um admin precisa aprovar antes de aparecer publicamente.');
      setForm(initialForm);
      setTimeout(() => navigate(ROUTES.points), 900);
    } catch (err) {
      setError('Nao foi possivel cadastrar o ponto. Confira as permissoes do Firestore.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="Cadastrar ponto de descarte"
      subtitle="O cadastro fica pendente ate a validacao administrativa, evitando pontos falsos no mapa."
    >
      <form onSubmit={handleSubmit} className="mx-auto max-w-5xl rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nome do ponto" id="name">
            <input id="name" className="form-input" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
          </Field>
          <Field label="Endereco" id="address">
            <input id="address" className="form-input" value={form.address} onChange={(e) => updateField('address', e.target.value)} required />
          </Field>
          <Field label="Cidade" id="city">
            <input id="city" className="form-input" value={form.city} onChange={(e) => updateField('city', e.target.value)} required />
          </Field>
          <Field label="Estado" id="state">
            <select id="state" className="form-input" value={form.state} onChange={(e) => updateField('state', e.target.value)}>
              {brazilianStates.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Bairro" id="neighborhood">
            <input id="neighborhood" className="form-input" value={form.neighborhood} onChange={(e) => updateField('neighborhood', e.target.value)} required />
          </Field>
          <Field label="Horario de funcionamento" id="openingHours">
            <input id="openingHours" className="form-input" value={form.openingHours} onChange={(e) => updateField('openingHours', e.target.value)} placeholder="Segunda a sexta, 08h as 18h" required />
          </Field>
          <Field label="Latitude" id="lat">
            <input id="lat" className="form-input" value={form.lat} onChange={(e) => updateField('lat', e.target.value)} placeholder="-21.6045" />
          </Field>
          <Field label="Longitude" id="lng">
            <input id="lng" className="form-input" value={form.lng} onChange={(e) => updateField('lng', e.target.value)} placeholder="-48.3650" />
          </Field>
          <div className="md:col-span-2">
            <Field label="URL de imagem" id="imageUrl">
              <input id="imageUrl" className="form-input" value={form.imageUrl} onChange={(e) => updateField('imageUrl', e.target.value)} placeholder="/PontoDescarte.png ou URL externa" />
            </Field>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="mb-2 text-sm font-semibold text-slate-700">Materiais aceitos</legend>
          <div className="flex flex-wrap gap-2">
            {materialOptions.map((material) => (
              <label key={material} className={`cursor-pointer rounded-full border px-3 py-2 text-sm font-semibold ${form.materials.includes(material) ? 'border-green-700 bg-green-100 text-green-800' : 'border-slate-300 bg-white text-slate-700'}`}>
                <input type="checkbox" className="sr-only" checked={form.materials.includes(material)} onChange={() => toggleMaterial(material)} />
                {material}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 space-y-3">
          {error && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}
        </div>

        <button type="submit" disabled={loading} className="mt-6 w-full rounded-md bg-green-700 px-4 py-3 font-bold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? 'Enviando...' : 'Enviar para validacao'}
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
