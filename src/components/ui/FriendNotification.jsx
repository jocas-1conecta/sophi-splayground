import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useFriendStore } from '../../stores/friendStore';
import { supabase, isDemoMode } from '../../services/supabase';
import './FriendNotification.css';

export default function FriendNotification() {
  const { user } = useAuthStore();
  const { acceptRequest, rejectRequest } = useFriendStore();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user?.id || isDemoMode || !supabase) return;

    const channel = supabase
      .channel('friend-requests')
      // New friend request received
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friendships',
          filter: `addressee_id=eq.${user.id}`,
        },
        async (payload) => {
          const request = payload.new;
          const { data: sender } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', request.requester_id)
            .single();

          addNotification({
            id: request.id,
            senderName: sender?.display_name || 'Alguien',
            message: 'quiere ser tu amiga 💌',
            type: 'request',
          });
        }
      )
      // Friend request accepted (your sent request)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'friendships',
          filter: `requester_id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.new.status !== 'accepted') return;
          const { data: friend } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', payload.new.addressee_id)
            .single();

          addNotification({
            id: payload.new.id + '-accepted',
            senderName: friend?.display_name || 'Alguien',
            message: 'aceptó tu solicitud 🎉',
            type: 'info',
          });

          // Refresh friends list
          const { useFriendStore } = await import('../../stores/friendStore');
          useFriendStore.getState().fetchAll(user.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  function addNotification(notif) {
    setNotifications((prev) => [...prev, { ...notif, timestamp: Date.now() }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    }, 15000);
  }

  const handleAccept = useCallback(async (requestId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== requestId));
    await acceptRequest(requestId, user?.id);
  }, [acceptRequest, user?.id]);

  const handleReject = useCallback(async (requestId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== requestId));
    await rejectRequest(requestId, user?.id);
  }, [rejectRequest, user?.id]);

  if (notifications.length === 0) return null;

  return (
    <div className="friend-notif-container">
      {notifications.map((notif) => (
        <div key={notif.id} className="friend-notif animate-fade-in-up">
          <div className="friend-notif-content">
            <div className="friend-notif-avatar">
              {notif.senderName.charAt(0)}
            </div>
            <div className="friend-notif-text">
              <strong>{notif.senderName}</strong>
              <span>{notif.message}</span>
            </div>
          </div>
          {notif.type === 'request' ? (
            <div className="friend-notif-actions">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleAccept(notif.id)}
              >
                Aceptar ✨
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleReject(notif.id)}
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id))}
            >
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
