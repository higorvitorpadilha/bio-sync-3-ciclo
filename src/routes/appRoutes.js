export const ROUTES = {
  home: '/',
  register: '/cadastro',
  userRegister: '/cadastro/usuario',
  pointRegister: '/cadastro/ponto-de-descarte',
  points: '/pontos-de-descarte',
  appointments: '/agendamentos',
  content: '/conteudos',
  news: '/noticias',
  profile: '/perfil',
  admin: '/admin',
};

export const legacyRouteRedirects = [
  { from: '/buttonsUserRegister', to: ROUTES.register },
  { from: '/UserRegister', to: ROUTES.userRegister },
  { from: '/DropPointsRegister', to: ROUTES.pointRegister },
  { from: '/dropPoints', to: ROUTES.points },
  { from: '/Agendamentos', to: ROUTES.appointments },
  { from: '/Conteudos', to: ROUTES.content },
  { from: '/Noticias', to: ROUTES.news },
  { from: '/Artigo1', to: `${ROUTES.content}/lixo-mal-descartado` },
  { from: '/profile', to: ROUTES.profile },
];
