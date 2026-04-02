import { getCategoryById } from '../../../constants/riddleBank';
import { getDifficultyInfo } from '../../../lib/riddleBattleLogic';
import './RiddleBattle.css';

export default function RiddleCard({ riddle, showAnswer, showHint }) {
  if (!riddle) return null;

  const category = getCategoryById(riddle.category_id);
  const difficulty = getDifficultyInfo(riddle.difficulty);

  return (
    <div className="rb-riddle-card card animate-fade-in-up">
      {/* Category + Difficulty badge */}
      <div className="rb-riddle-meta">
        <span className="badge badge-ghost">
          {category.emoji} {category.name}
        </span>
        <span className="badge badge-ghost">
          {difficulty.stars} {difficulty.label}
        </span>
      </div>

      {/* Question */}
      <p className="rb-riddle-question">{riddle.question}</p>

      {/* Hint */}
      {showHint && riddle.hint && (
        <p className="rb-riddle-hint animate-fade-in">
          💡 Pista: {riddle.hint}
        </p>
      )}

      {/* Answer reveal */}
      {showAnswer && (
        <div className="rb-riddle-answer animate-pop-in">
          <span className="rb-riddle-answer-label">Respuesta:</span>
          <span className="rb-riddle-answer-text">{riddle.answer}</span>
        </div>
      )}
    </div>
  );
}
