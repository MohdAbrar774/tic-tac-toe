import { useMemo, useState } from 'react'
import './App.css'
import { useForestAmbience } from './useForestAmbience'

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

const createBoard = () => Array(9).fill(null)

function getGameState(board) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line

    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a],
        winningLine: line,
        isDraw: false,
      }
    }
  }

  return {
    winner: null,
    winningLine: [],
    isDraw: board.every(Boolean),
  }
}

function StatusPanel({
  currentPlayer,
  winner,
  isDraw,
  moves,
  isSoundOn,
  isAudioAvailable,
  onSoundToggle,
  onReset,
}) {
  const statusLabel = winner
    ? `Player ${winner} wins`
    : isDraw
      ? 'Round draw'
      : `Player ${currentPlayer}'s turn`

  const statusDetail = winner
    ? 'Three in a row. Clean finish.'
    : isDraw
      ? 'The board is full with no winner.'
      : `Move ${moves + 1} of 9`

  return (
    <section className="status-panel" aria-live="polite">
      <div>
        <p className="eyebrow">Forest Tic Tac Toe</p>
        <h1>{statusLabel}</h1>
        <p className="status-detail">{statusDetail}</p>
      </div>

      <div className="player-strip" aria-label="Current turn">
        <PlayerBadge player="X" isActive={!winner && !isDraw && currentPlayer === 'X'} />
        <PlayerBadge player="O" isActive={!winner && !isDraw && currentPlayer === 'O'} />
      </div>

      <div className="round-meta" aria-label="Round status">
        <span>
          <strong>{moves}</strong>
          Moves
        </span>
        <span>
          <strong>{9 - moves}</strong>
          Open
        </span>
      </div>

      <div className="action-stack">
        <button
          className={`sound-button ${isSoundOn ? 'is-on' : ''}`}
          type="button"
          aria-pressed={isSoundOn}
          disabled={!isAudioAvailable}
          onClick={onSoundToggle}
        >
          <span className="sound-indicator" aria-hidden="true" />
          {isAudioAvailable ? (isSoundOn ? 'Forest sound on' : 'Forest sound off') : 'No audio'}
        </button>

        <button className="reset-button" type="button" onClick={onReset}>
          Reset game
        </button>
      </div>
    </section>
  )
}

function PlayerBadge({ player, isActive }) {
  return (
    <span className={`player-badge player-${player.toLowerCase()} ${isActive ? 'is-active' : ''}`}>
      <span className="mark-preview">{player}</span>
      Player {player}
    </span>
  )
}

function GameBoard({ board, isGameOver, winningLine, onSquareClick }) {
  return (
    <section className="board-shell" aria-label="Game board">
      <div className="board-grid" role="grid">
        {board.map((value, index) => (
          <Square
            key={index}
            index={index}
            value={value}
            isWinning={winningLine.includes(index)}
            isDisabled={Boolean(value) || isGameOver}
            onClick={() => onSquareClick(index)}
          />
        ))}
      </div>
    </section>
  )
}

function Square({ index, value, isWinning, isDisabled, onClick }) {
  const row = Math.floor(index / 3) + 1
  const column = (index % 3) + 1
  const label = value
    ? `Row ${row}, column ${column}, marked by player ${value}`
    : `Row ${row}, column ${column}, empty`

  return (
    <button
      className={`square ${value ? `mark-${value.toLowerCase()}` : ''} ${
        isWinning ? 'is-winning' : ''
      }`}
      type="button"
      role="gridcell"
      aria-label={label}
      disabled={isDisabled}
      onClick={onClick}
    >
      <span>{value}</span>
    </button>
  )
}

function App() {
  const [board, setBoard] = useState(createBoard)
  const [xIsNext, setXIsNext] = useState(true)
  const { isSoundOn, isAudioAvailable, toggleSound } = useForestAmbience()
  const gameState = useMemo(() => getGameState(board), [board])

  const currentPlayer = xIsNext ? 'X' : 'O'
  const moves = board.filter(Boolean).length
  const isGameOver = Boolean(gameState.winner) || gameState.isDraw

  function handleSquareClick(index) {
    if (board[index] || isGameOver) {
      return
    }

    const nextBoard = [...board]
    nextBoard[index] = currentPlayer
    setBoard(nextBoard)
    setXIsNext((current) => !current)
  }

  function resetGame() {
    setBoard(createBoard())
    setXIsNext(true)
  }

  return (
    <main className="app">
      <div className="game-layout">
        <StatusPanel
          currentPlayer={currentPlayer}
          winner={gameState.winner}
          isDraw={gameState.isDraw}
          moves={moves}
          isSoundOn={isSoundOn}
          isAudioAvailable={isAudioAvailable}
          onSoundToggle={toggleSound}
          onReset={resetGame}
        />

        <GameBoard
          board={board}
          isGameOver={isGameOver}
          winningLine={gameState.winningLine}
          onSquareClick={handleSquareClick}
        />
      </div>
    </main>
  )
}

export default App
