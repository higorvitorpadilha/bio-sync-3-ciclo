import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, LogOut, ShieldCheck, UserCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { roleLabels } from '../data/demoData.js';
import { ROUTES } from '../routes/appRoutes.js';

export default function Header({ openLoginModal }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isFirebaseConfigured } = useAuth();
  const logo = '/logo-bio-sync-login.png';
  const userlogin = '/user.png';

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  const navItems = [
    { label: 'Home', to: ROUTES.home },
    { label: 'Pontos', to: ROUTES.points },
    { label: 'Agendamentos', to: ROUTES.appointments },
    { label: 'Conteudos', to: ROUTES.content },
    { label: 'Noticias', to: ROUTES.news },
  ];

  const navClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-semibold transition ${
      isActive ? 'bg-white text-green-700' : 'text-white hover:bg-white/15'
    }`;

  const renderUserActions = (mobile = false) => {
    if (!user) {
      return (
        <div className={mobile ? 'space-y-2' : 'flex items-center gap-3'}>
          <button
            onClick={openLoginModal}
            className="rounded-md border border-white/50 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15"
          >
            Login
          </button>
          <Link
            to={ROUTES.register}
            onClick={() => setIsMenuOpen(false)}
            className="inline-flex rounded-md bg-white px-3 py-2 text-sm font-semibold text-green-700 hover:bg-slate-100"
          >
            Cadastre-se
          </Link>
        </div>
      );
    }

    return (
      <div className={mobile ? 'space-y-2 text-white' : 'flex items-center gap-3 text-white'}>
        <Link
          to={ROUTES.profile}
          onClick={() => setIsMenuOpen(false)}
          className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-white/15"
        >
          <img src={user.photoUrl || user.photoURL || userlogin} alt="" className="h-8 w-8 rounded-full" />
          <span className="text-sm">
            <strong className="block">{user.displayName || user.email}</strong>
            <span className="text-xs text-white/80">{roleLabels[user.role] || user.role}</span>
          </span>
        </Link>
        {user.role === 'admin' && (
          <Link
            to={ROUTES.admin}
            onClick={() => setIsMenuOpen(false)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-2 text-sm font-semibold hover:bg-white/15"
          >
            <ShieldCheck size={16} />
            Admin
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1 rounded-md px-2 py-2 text-sm font-semibold hover:bg-white/15"
          aria-label="Sair"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    );
  };

  return (
    <header className="bg-green-700 shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link to={ROUTES.home} className="flex items-center gap-3 text-white">
            <img src={logo} alt="BioSync" className="h-12 w-10 rounded-md object-contain" />
            <div>
              <span className="block text-lg font-bold leading-5">BioSync</span>
              <span className="text-xs text-white/75">
                {isFirebaseConfigured ? 'Firestore conectado' : 'Modo demo local'}
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:block">{renderUserActions()}</div>

          <button
            className="rounded-md p-2 text-white md:hidden"
            onClick={() => setIsMenuOpen((value) => !value)}
            aria-label="Abrir menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="mt-4 space-y-2 border-t border-white/20 pt-4 md:hidden">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setIsMenuOpen(false)} className={navClass}>
                {item.label}
              </NavLink>
            ))}
            <Link
              to={ROUTES.profile}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-white hover:bg-white/15"
            >
              <UserCircle size={18} />
              Perfil
            </Link>
            <div className="pt-2">{renderUserActions(true)}</div>
          </div>
        )}
      </nav>
    </header>
  );
}
