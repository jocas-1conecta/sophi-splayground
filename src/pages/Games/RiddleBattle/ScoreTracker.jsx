import './RiddleBattle.css';

export default function ScoreTracker({ p1Wins, p2Wins, currentRound, totalRounds, p1Name, p2Name }) {
  const rounds = Array.from({ length: totalRounds }, (_, i) => i);

  return (
    <div className="rb-score-tracker">
      <div className="rb-score-player">
        <span className="rb-score-name">{p1Name}</span>
        <div className="rb-score-dots">
          {rounds.map((r) => (
            <span
              key={`p1-${r}`}
              className={`rb-dot ${r < p1Wins ? 'won' : r === currentRound ? 'current' : ''}`}
            >
              {r < p1Wins ? '●' : '○'}
            </span>
          ))}
        </div>
      </div>

      <span className="rb-score-vs">VS</span>

      <div className="rb-score-player">
        <span className="rb-score-name">{p2Name}</span>
        <div className="rb-score-dots">
          {rounds.map((r) => (
            <span
              key={`p2-${r}`}
              className={`rb-dot ${r < p2Wins ? 'won' : r === currentRound ? 'current' : ''}`}
            >
              {r < p2Wins ? '●' : '○'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
