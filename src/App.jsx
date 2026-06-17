import React, { useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';

import Home from './pages/Home/Home.jsx';
import ButtonsUserRegister from './pages/Register/ButtonsUserRegister.jsx';
import PontosDeDescarte from './pages/dropPoints/PontosDeDescarte.jsx';
import LoginModal from './components/LoginModal.jsx';
import RegistroDeUsuarios from './pages/Register/UserRegister.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Agendamentos from './pages/Agendamentos/Agendamentos.jsx';
import Conteudos from './pages/Conteudos/Conteudos.jsx';
import ContentDetail from './pages/Conteudos/ContentDetail.jsx';
import Noticias from './pages/Noticias/Noticias.jsx';
import DropPointsRegister from './pages/Register/DropPoints.jsx';
import Profile from './pages/Profile.jsx';
import Admin from './pages/Admin/Admin.jsx';
import NotFound from './pages/NotFound.jsx';
import VLibras from './components/VLibras.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { legacyRouteRedirects, ROUTES } from './routes/appRoutes.js';
import './App.css';

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-950">
          <Header openLoginModal={() => setIsLoginModalOpen(true)} />
          <Routes>
            <Route path={ROUTES.home} element={<Home />} />
            <Route path={ROUTES.register} element={<ButtonsUserRegister />} />
            <Route path={ROUTES.userRegister} element={<RegistroDeUsuarios />} />
            <Route path={ROUTES.pointRegister} element={<DropPointsRegister />} />
            <Route path={ROUTES.points} element={<PontosDeDescarte />} />
            <Route path={ROUTES.appointments} element={<Agendamentos />} />
            <Route path={ROUTES.content} element={<Conteudos />} />
            <Route path={`${ROUTES.content}/:slug`} element={<ContentDetail type="content" />} />
            <Route path={ROUTES.news} element={<Noticias />} />
            <Route path={`${ROUTES.news}/:slug`} element={<ContentDetail type="news" />} />
            <Route path={ROUTES.profile} element={<Profile />} />
            <Route path={ROUTES.admin} element={<Admin />} />
            {legacyRouteRedirects.map((route) => (
              <Route
                key={route.from}
                path={route.from}
                element={<Navigate to={route.to} replace />}
              />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
          <Footer />
          <VLibras />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
