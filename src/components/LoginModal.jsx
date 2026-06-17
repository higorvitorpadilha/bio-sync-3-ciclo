import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../routes/appRoutes.js';

export default function LoginModal({ isOpen, onClose }) {
  const { login, resetPassword, isFirebaseConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess('');
    setLoading(true);

    try {
      await login(email, password);
      onClose();
    } catch (error) {
      setError('Nao foi possivel entrar. Confira e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    setSuccess('');
    try {
      await resetPassword(email);
      setSuccess('Se o e-mail existir, enviaremos as instrucoes de recuperacao.');
    } catch (error) {
      setError(error.message || 'Informe seu e-mail antes de recuperar a senha.');
    }
  };

  const logo = '/logo-bio-sync-login.png';

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-slate-950/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-md bg-slate-950 p-6 text-white shadow-xl">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>

          <div className="mb-6 flex items-center gap-4">
            <img src={logo} className="h-14 w-12 object-contain" alt="BioSync" />
            <div>
              <Dialog.Title className="text-2xl font-bold">Login</Dialog.Title>
              <p className="text-sm text-white/65">
                {isFirebaseConfigured ? 'Ambiente Firebase' : 'Modo demo: use doador@biosync.local'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="mb-1 block text-sm font-semibold">
                E-mail
              </label>
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-green-400"
                required
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1 block text-sm font-semibold">
                Senha
              </label>
              <input
                type="password"
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-green-400"
                required
                placeholder="Senha"
              />
              <button
                type="button"
                onClick={handlePasswordReset}
                className="mt-2 text-sm font-semibold text-green-300 hover:text-green-200"
              >
                Esqueci minha senha
              </button>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-green-500 py-2 font-bold text-slate-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            {error && <p className="rounded-md bg-red-500/15 p-3 text-sm text-red-200">{error}</p>}
            {success && <p className="rounded-md bg-green-500/15 p-3 text-sm text-green-200">{success}</p>}
          </form>

          <div className="mt-4 flex justify-center gap-2 text-sm">
            <span className="text-white/70">Nao tem cadastro?</span>
            <Link to={ROUTES.register} onClick={onClose} className="font-semibold text-green-300 hover:text-green-200">
              Registre-se
            </Link>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
