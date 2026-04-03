import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from './stores/authStore';
import { ROUTES } from './constants/routes';

/* Layout */
import Layout from './components/layout/Layout';

/* Pages */
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import HomePage from './pages/Home/HomePage';
import ProfilePage from './pages/Profile/ProfilePage';
import FriendsPage from './pages/Friends/FriendsPage';
import LobbyPage from './pages/Lobby/LobbyPage';
import RewardsPage from './pages/Rewards/RewardsPage';
import MatchHistoryPage from './pages/History/MatchHistoryPage';

/* Game Pages */
import TicTacToePage from './pages/Games/TicTacToe/TicTacToePage';
import TuttiFruttiPage from './pages/Games/TuttiFrutti/TuttiFruttiPage';
import RiddleBattlePage from './pages/Games/RiddleBattle/RiddleBattlePage';

/* Components */
import LoadingScreen from './components/feedback/LoadingScreen';
import InstallPrompt from './components/ui/InstallPrompt';
import FriendNotification from './components/ui/FriendNotification';
import GameInviteListener from './components/ui/GameInviteListener';

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;

  return children;
}

function AuthRoute({ children }) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <LoadingScreen />;
  if (user) return <Navigate to={ROUTES.HOME} replace />;

  return children;
}

export default function App() {
  const { init } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    init().finally(() => setReady(true));
  }, [init]);

  if (!ready) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route
          path={ROUTES.LOGIN}
          element={
            <AuthRoute>
              <LoginPage />
            </AuthRoute>
          }
        />
        <Route
          path={ROUTES.REGISTER}
          element={
            <AuthRoute>
              <RegisterPage />
            </AuthRoute>
          }
        />

        {/* Protected routes with layout (bottom nav) */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.FRIENDS} element={<FriendsPage />} />
          <Route path={ROUTES.LOBBY} element={<LobbyPage />} />
          <Route path={ROUTES.REWARDS} element={<RewardsPage />} />
          <Route path={ROUTES.HISTORY} element={<MatchHistoryPage />} />
        </Route>

        {/* Game routes — no bottom nav, own layout */}
        <Route
          path={ROUTES.GAME_TICTACTOE}
          element={
            <ProtectedRoute>
              <TicTacToePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.GAME_TUTTIFRUTTI}
          element={
            <ProtectedRoute>
              <TuttiFruttiPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.GAME_RIDDLES}
          element={
            <ProtectedRoute>
              <RiddleBattlePage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
      <InstallPrompt />
      <FriendNotification />
      <GameInviteListener />
    </BrowserRouter>
  );
}
