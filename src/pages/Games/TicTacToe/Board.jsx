import Cell from './Cell';
import './TicTacToe.css';

export default function Board({ board, winningCombo, isMyTurn, onCellClick }) {
  return (
    <div className="ttt-board animate-fade-in-up">
      {board.map((value, index) => (
        <Cell
          key={index}
          index={index}
          value={value}
          isWinning={winningCombo?.includes(index) || false}
          isActive={isMyTurn}
          onClick={onCellClick}
        />
      ))}
    </div>
  );
}
