import { useState, useEffect } from 'react';
import { AVAILABLE_LETTERS } from '../../../lib/tuttiFruttiLogic';
import './TuttiFrutti.css';

export default function LetterSpinner({ targetLetter, onComplete }) {
  const [displayLetter, setDisplayLetter] = useState('?');
  const [isSpinning, setIsSpinning] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (!targetLetter) return;

    let frame = 0;
    const totalFrames = 20;
    const interval = setInterval(() => {
      frame++;
      // Pick a random letter while spinning
      const randomLetter = AVAILABLE_LETTERS[Math.floor(Math.random() * AVAILABLE_LETTERS.length)];
      setDisplayLetter(randomLetter);

      if (frame >= totalFrames) {
        clearInterval(interval);
        setDisplayLetter(targetLetter);
        setIsSpinning(false);

        // Reveal animation
        setTimeout(() => {
          setIsRevealed(true);
          setTimeout(() => onComplete?.(), 1000);
        }, 300);
      }
    }, 80); // Spins for ~1.6 seconds

    return () => clearInterval(interval);
  }, [targetLetter, onComplete]);

  return (
    <div className="tf-spinner-container animate-fade-in">
      <p className="tf-spinner-label">¡La letra es...!</p>
      <div className={`tf-spinner-letter ${isSpinning ? 'spinning' : ''} ${isRevealed ? 'revealed' : ''}`}>
        <span>{displayLetter}</span>
      </div>
      {isRevealed && (
        <p className="tf-spinner-go animate-pop-in">¡A llenar! ✏️</p>
      )}
    </div>
  );
}
