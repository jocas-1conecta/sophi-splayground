import './TicTacToe.css';

export default function Cell({ value, index, isWinning, isActive, onClick }) {
  const handleClick = () => {
    if (value || !isActive) return;
    onClick(index);
  };

  return (
    <button
      className={`ttt-cell ${value ? 'filled' : ''} ${isActive && !value ? 'active' : ''} ${isWinning ? 'winning' : ''}`}
      onClick={handleClick}
      disabled={!isActive || !!value}
      aria-label={`Celda ${index + 1}: ${value || 'vacía'}`}
    >
      {value && (
        <span className={`ttt-piece ttt-piece-${value} animate-pop-in`}>
          {value === 'X' ? '❌' : '⭕'}
        </span>
      )}
    </button>
  );
}
