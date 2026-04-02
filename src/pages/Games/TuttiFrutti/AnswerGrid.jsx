import { useRef, useEffect } from 'react';
import { TUTTI_FRUTTI_CATEGORIES } from '../../../constants/gameConfig';
import './TuttiFrutti.css';

export default function AnswerGrid({ letter, answers, onChange, disabled }) {
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (!disabled) {
      setTimeout(() => firstInputRef.current?.focus(), 200);
    }
  }, [disabled]);

  const handleChange = (categoryId, value) => {
    onChange({ ...answers, [categoryId]: value });
  };

  return (
    <div className="tf-grid animate-fade-in-up">
      {TUTTI_FRUTTI_CATEGORIES.map((cat, idx) => (
        <div key={cat.id} className="tf-grid-row">
          <label className="tf-grid-label">
            <span className="tf-grid-emoji">{cat.emoji}</span>
            <span className="tf-grid-cat">{cat.label}</span>
          </label>
          <div className="tf-grid-input-wrapper">
            <span className="tf-grid-letter-hint">{letter}</span>
            <input
              ref={idx === 0 ? firstInputRef : null}
              className="input tf-grid-input"
              type="text"
              placeholder={`${cat.label} con ${letter}...`}
              value={answers[cat.id] || ''}
              onChange={(e) => handleChange(cat.id, e.target.value)}
              disabled={disabled}
              autoComplete="off"
              maxLength={30}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
