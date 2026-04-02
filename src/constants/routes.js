export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  HOME: '/',
  PROFILE: '/profile',
  FRIENDS: '/friends',
  LOBBY: '/lobby',
  REWARDS: '/rewards',
  HISTORY: '/history',
  GAME_TICTACTOE: '/game/tic-tac-toe/:sessionId',
  GAME_TUTTIFRUTTI: '/game/tutti-frutti/:sessionId',
  GAME_RIDDLES: '/game/riddle-battle/:sessionId',
};

export const NAV_ITEMS = [
  { path: ROUTES.HOME, label: 'Inicio', emoji: '🏠' },
  { path: ROUTES.LOBBY, label: 'Jugar', emoji: '🎮' },
  { path: ROUTES.FRIENDS, label: 'Amigas', emoji: '👯' },
  { path: ROUTES.PROFILE, label: 'Perfil', emoji: '✨' },
];
