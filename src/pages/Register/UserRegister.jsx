import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, PageShell } from '../../components/Ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { brazilianStates } from '../../data/demoData.js';
import { ROUTES } from '../../routes/appRoutes.js';

export default function CadastroUsuario() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [role, setRole] = useState('donor');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const validarDados = () => {
    if (displayName.trim().length < 3) {
      setErro('Informe um nome com pelo menos 3 caracteres.');
      return false;
    }
    if (!city.trim()) {
      setErro('Informe a cidade.');
      return false;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      setErro('Informe um celular valido.');
      return false;
    }
    if (password.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    if (password !== confirmPassword) {
      setErro('As senhas nao coincidem.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso(false);

    if (!validarDados()) return;

    setCarregando(true);
    try {
      await register({
        displayName: displayName.trim(),
        email,
        phone,
        city: city.trim(),
        state,
        role,
        password,
      });
      setSucesso(true);
      setTimeout(() => navigate(ROUTES.profile), 700);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setErro('Este e-mail ja esta em uso por outro usuario.');
      } else {
        setErro('Erro ao cadastrar usuario. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <PageShell
      title="Cadastro de usuario"
      subtitle="CPF completo nao e armazenado nesta versao para reduzir risco LGPD. O perfil define as permissoes no Firestore."
    >
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Nome completo" id="nome">
            <input id="nome" className="form-input" placeholder="Nome completo" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </Field>
          <Field label="E-mail" id="email">
            <input id="email" type="email" className="form-input" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Celular" id="celular">
            <input id="celular" type="tel" className="form-input" placeholder="(16) 99999-0000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </Field>
          <Field label="Cidade" id="cidade">
            <input id="cidade" className="form-input" placeholder="Matao" value={city} onChange={(e) => setCity(e.target.value)} required />
          </Field>
          <Field label="Estado" id="estado">
            <select id="estado" value={state} onChange={(e) => setState(e.target.value)} className="form-input">
              {brazilianStates.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tipo de perfil" id="role">
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="form-input">
              <option value="donor">Doador</option>
              <option value="collector">Catador</option>
            </select>
          </Field>
          <Field label="Senha" id="senha">
            <input id="senha" type="password" className="form-input" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          <Field label="Confirmar senha" id="confirmarSenha">
            <input id="confirmarSenha" type="password" className="form-input" placeholder="Confirmar senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </Field>
        </div>

        <div className="mt-5 space-y-3">
          {erro && <Alert type="error">{erro}</Alert>}
          {sucesso && <Alert type="success">Cadastro realizado. Redirecionando para o perfil...</Alert>}
        </div>

        <button type="submit" className="mt-6 w-full rounded-md bg-green-700 px-4 py-3 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70" disabled={carregando}>
          {carregando ? 'Cadastrando...' : 'Cadastrar usuario'}
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
