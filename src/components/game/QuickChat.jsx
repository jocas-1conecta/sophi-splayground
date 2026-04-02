import { useState, useEffect, useRef } from 'react';
import { QUICK_CHAT_PHRASES } from '../../constants/quickChatPhrases';
import { useGameStore } from '../../stores/gameStore';
import './QuickChat.css';

export default function QuickChat({ myPlayerId }) {
  const { quickChatMessages, addQuickChatMessage } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(null);
  const bubbleTimeout = useRef(null);

  // Show bubble when new message arrives
  useEffect(() => {
    if (quickChatMessages.length === 0) return;
    const last = quickChatMessages[quickChatMessages.length - 1];
    if (last.player_id !== myPlayerId) {
      const phrase = QUICK_CHAT_PHRASES.find((p) => p.id === last.phrase_id);
      if (phrase) {
        setShowBubble(phrase);
        clearTimeout(bubbleTimeout.current);
        bubbleTimeout.current = setTimeout(() => setShowBubble(null), 3000);
      }
    }
  }, [quickChatMessages, myPlayerId]);

  const handleSend = (phrase) => {
    addQuickChatMessage({
      phrase_id: phrase.id,
      player_id: myPlayerId,
    });
    setIsOpen(false);

    // Show own bubble briefly
    setShowBubble(phrase);
    clearTimeout(bubbleTimeout.current);
    bubbleTimeout.current = setTimeout(() => setShowBubble(null), 2000);
  };

  return (
    <div className="quick-chat">
      {/* Floating bubble */}
      {showBubble && (
        <div className="quick-chat-bubble animate-pop-in">
          <span className="quick-chat-bubble-emoji">{showBubble.emoji}</span>
          <span className="quick-chat-bubble-text">{showBubble.text}</span>
        </div>
      )}

      {/* Phrase picker */}
      {isOpen && (
        <div className="quick-chat-picker animate-fade-in-up">
          <div className="quick-chat-grid">
            {QUICK_CHAT_PHRASES.map((phrase) => (
              <button
                key={phrase.id}
                className="quick-chat-phrase"
                onClick={() => handleSend(phrase)}
              >
                <span className="quick-chat-phrase-emoji">{phrase.emoji}</span>
                <span className="quick-chat-phrase-text">{phrase.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        className={`quick-chat-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Quick Chat"
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
}
