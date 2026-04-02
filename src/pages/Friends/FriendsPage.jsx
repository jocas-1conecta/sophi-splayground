import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useFriendStore } from '../../stores/friendStore';
import { isDemoMode } from '../../services/supabase';
import './Friends.css';

/* ── Sub-Components ── */

function AddFriendSection() {
  const { user } = useAuthStore();
  const { searchByCode, sendRequest, clearError } = useFriendStore();
  const [code, setCode] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text }

  const handleSearch = async () => {
    if (code.length !== 6) {
      setMessage({ type: 'error', text: 'El código debe tener 6 caracteres' });
      return;
    }

    // Don't search for own code
    if (isDemoMode && code.toUpperCase() === 'DEMO01') {
      setMessage({ type: 'error', text: '¡Ese es tu propio código! 😅' });
      return;
    }

    setSearching(true);
    setMessage(null);
    setSearchResult(null);
    clearError();

    try {
      const profile = await searchByCode(code.toUpperCase());
      if (profile) {
        if (profile.id === user?.id) {
          setMessage({ type: 'error', text: '¡Ese es tu propio código! 😅' });
        } else {
          setSearchResult(profile);
        }
      } else {
        setMessage({ type: 'error', text: 'No se encontró ninguna jugadora con ese código 🔍' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al buscar: ' + err.message });
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async () => {
    if (!searchResult || !user) return;
    setSending(true);
    setMessage(null);

    try {
      await sendRequest(user.id, searchResult.id);
      setMessage({ type: 'success', text: `¡Solicitud enviada a ${searchResult.display_name}! 🎉` });
      setSearchResult(null);
      setCode('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="friends-section animate-fade-in-up">
      <h3 className="friends-section-title">🔗 Agregar Amiga</h3>
      <div className="add-friend-form">
        <div className="add-friend-input-row">
          <input
            type="text"
            className="input add-friend-input"
            placeholder="Código de amiga (ej: LUN4S7)"
            maxLength={6}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setSearchResult(null);
              setMessage(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            className="btn btn-primary add-friend-btn"
            onClick={handleSearch}
            disabled={code.length < 6 || searching}
          >
            {searching ? '...' : '🔍'}
          </button>
        </div>

        {message && (
          <div className={`friend-message friend-message-${message.type} animate-fade-in`}>
            {message.text}
          </div>
        )}

        {searchResult && (
          <div className="search-result-card card animate-pop-in">
            <div className="search-result-info">
              <div className="avatar avatar-lg">
                {searchResult.display_name?.charAt(0) || '?'}
              </div>
              <div className="search-result-details">
                <span className="search-result-name">{searchResult.display_name}</span>
                <span className="search-result-username">@{searchResult.username}</span>
              </div>
            </div>
            <button
              className="btn btn-secondary"
              onClick={handleSendRequest}
              disabled={sending}
            >
              {sending ? 'Enviando...' : 'Enviar solicitud 💌'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function PendingRequestCard({ request, onAccept, onReject }) {
  const [acting, setActing] = useState(false);
  const profile = request.requester;
  const timeAgo = getTimeAgo(request.created_at);

  const handleAction = async (action) => {
    setActing(true);
    await action();
    setActing(false);
  };

  return (
    <div className="friend-card card animate-fade-in-up">
      <div className="friend-card-left">
        <div className="avatar">
          {profile.display_name?.charAt(0) || '?'}
        </div>
        <div className="friend-card-info">
          <span className="friend-card-name">{profile.display_name}</span>
          <span className="friend-card-meta">Hace {timeAgo}</span>
        </div>
      </div>
      <div className="friend-card-actions">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => handleAction(onAccept)}
          disabled={acting}
        >
          ✅
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => handleAction(onReject)}
          disabled={acting}
        >
          ❌
        </button>
      </div>
    </div>
  );
}

function SentRequestCard({ request }) {
  const profile = request.addressee;
  const timeAgo = getTimeAgo(request.created_at);

  return (
    <div className="friend-card card friend-card-sent animate-fade-in-up">
      <div className="friend-card-left">
        <div className="avatar avatar-muted">
          {profile.display_name?.charAt(0) || '?'}
        </div>
        <div className="friend-card-info">
          <span className="friend-card-name">{profile.display_name}</span>
          <span className="friend-card-meta">Enviada hace {timeAgo}</span>
        </div>
      </div>
      <span className="badge badge-ghost">Pendiente ⏳</span>
    </div>
  );
}

function FriendCard({ friend, isOnline, onRemove }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="friend-card card animate-fade-in-up">
      <div className="friend-card-left">
        <div className="avatar-wrapper">
          <div className="avatar">
            {friend.display_name?.charAt(0) || '?'}
          </div>
          <span className={`online-dot ${isOnline ? 'online' : 'offline'}`} />
        </div>
        <div className="friend-card-info">
          <span className="friend-card-name">{friend.display_name}</span>
          <span className="friend-card-meta">
            💎 {friend.points} pts · 🏆 {friend.games_won}/{friend.games_played}
          </span>
        </div>
      </div>
      <div className="friend-card-actions">
        {!showConfirm ? (
          <button
            className="btn btn-ghost btn-sm friend-remove-btn"
            onClick={() => setShowConfirm(true)}
            title="Eliminar amiga"
          >
            ···
          </button>
        ) : (
          <div className="friend-confirm-remove animate-pop-in">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowConfirm(false)}
            >
              Cancelar
            </button>
            <button
              className="btn btn-sm friend-btn-danger"
              onClick={onRemove}
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Page ── */

export default function FriendsPage() {
  const { user } = useAuthStore();
  const {
    friends,
    pendingReceived,
    pendingSent,
    onlineUsers,
    isLoading,
    fetchAll,
    acceptRequest,
    rejectRequest,
    removeFriend,
  } = useFriendStore();

  const [activeTab, setActiveTab] = useState('friends'); // 'friends' | 'requests'

  useEffect(() => {
    if (user?.id) {
      fetchAll(user.id);
    }
  }, [user?.id, fetchAll]);

  // Simulate some online users in demo mode
  useEffect(() => {
    if (isDemoMode) {
      const { setOnlineUsers } = useFriendStore.getState();
      setOnlineUsers({
        'friend-1': true,  // Luna online
        'friend-2': false, // Valentina offline
        'friend-3': true,  // Camila online
      });
    }
  }, []);

  const pendingCount = pendingReceived.length + pendingSent.length;

  return (
    <div className="friends-page">
      {/* Header */}
      <div className="page-header animate-fade-in-up">
        <h2>👯 Mis Amigas</h2>
        <p className="page-subtitle">Conecta, juega y diviértete</p>
      </div>

      {/* Add Friend */}
      <AddFriendSection />

      {/* Tabs */}
      <div className="friends-tabs animate-fade-in-up">
        <button
          className={`friends-tab ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          Amigas ({friends.length})
        </button>
        <button
          className={`friends-tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Solicitudes
          {pendingCount > 0 && (
            <span className="friends-tab-badge">{pendingCount}</span>
          )}
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="friends-loading">
          <span className="animate-spin">🌀</span>
          <p>Cargando...</p>
        </div>
      ) : activeTab === 'friends' ? (
        /* ── Friends List ── */
        <section className="friends-list">
          {friends.length === 0 ? (
            <div className="empty-state animate-fade-in-up">
              <span className="empty-state-emoji">🔍</span>
              <p className="empty-state-title">Aún no tienes amigas</p>
              <p className="empty-state-description">
                ¡Pide el código de amiga de alguien para empezar!
              </p>
            </div>
          ) : (
            <div className="stagger-children">
              {friends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  isOnline={onlineUsers[friend.id] || false}
                  onRemove={() => removeFriend(friend.friendship_id, user.id)}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        /* ── Requests Tab ── */
        <section className="friends-requests">
          {/* Received */}
          {pendingReceived.length > 0 && (
            <div className="requests-group">
              <h4 className="requests-group-title">📥 Recibidas</h4>
              <div className="stagger-children">
                {pendingReceived.map((req) => (
                  <PendingRequestCard
                    key={req.id}
                    request={req}
                    onAccept={() => acceptRequest(req.id, user.id)}
                    onReject={() => rejectRequest(req.id, user.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sent */}
          {pendingSent.length > 0 && (
            <div className="requests-group">
              <h4 className="requests-group-title">📤 Enviadas</h4>
              <div className="stagger-children">
                {pendingSent.map((req) => (
                  <SentRequestCard key={req.id} request={req} />
                ))}
              </div>
            </div>
          )}

          {/* Empty */}
          {pendingReceived.length === 0 && pendingSent.length === 0 && (
            <div className="empty-state animate-fade-in-up">
              <span className="empty-state-emoji">📭</span>
              <p className="empty-state-title">Sin solicitudes</p>
              <p className="empty-state-description">
                No tienes solicitudes pendientes por ahora
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

/* ── Helpers ── */

function getTimeAgo(dateString) {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'un momento';
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  return `${days}d`;
}
