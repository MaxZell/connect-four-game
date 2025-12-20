import {useEffect, useMemo, useRef} from 'react'
import './App.css'
import Controls from './components/Controls.tsx'
import Board, { type Cell, type Player, player1, player2, player1Name, player2Name } from './components/Board'
import {useHistoryState} from './hooks/useHistoryState.ts'
import confetti from 'canvas-confetti'

const LS_Key: string = 'connect4'
const cols: number = 7
const rows: number = 6

type GameState = {
    board: Cell[][];
    current: Player;
    winner: Player | 'Draw' | null;
    lastMove: { row: number; col: number; player: Player } | null;
}

const emptyBoard: Cell[][] = [...Array(rows)].map(() => Array(cols).fill(null))

const other = (p: Player): Player => {
    return p === player1 ? player2 : player1
}

function cloneBoard(board: Cell[][]): Cell[][] {
    return board.map((r: Cell[]) => r.slice())
}

function dropInColumn(board: Cell[][], col: number, player: Player) {
    for (let row = rows - 1; row >= 0; row--) {
        if (board[row][col] === null) {
            const next = cloneBoard(board)
            next[row][col] = player
            return { nextBoard: next, row }
        }
    }
    return null
}

const inBounds = (r: number, c: number): boolean => {
    return r >= 0 && r < rows && c >= 0 && c < cols
}

const checkWinner = (board: Cell[][], last: { row: number; col: number; player: Player } | null): Player | null => {
    if (!last) return null
    const { row, col, player } = last

    const dirs: { dr: number, dc: number}[] = [
        { dr: 0, dc: 1 },
        { dr: 1, dc: 0 },
        { dr: 1, dc: 1 },
        { dr: 1, dc: -1 },
    ]

    for (const { dr, dc } of dirs) {
        let count: number = 1

        let r: number = row + dr
        let c: number = col + dc
        while (inBounds(r, c) && board[r][c] === player) {
            count++; r += dr; c += dc
        }

        r = row - dr
        c = col - dc
        while (inBounds(r, c) && board[r][c] === player) {
            count++; r -= dr; c -= dc
        }

        if (count >= 4) return player
    }
    return null
}

const isDraw = (board: Cell[][]): boolean => {
    return board[0].every((cell: Cell): boolean => cell !== null)
}

const defaultState = (): GameState => {
    return { board: emptyBoard, current: player1, winner: null, lastMove: null }
}

function App() {
    const game = useHistoryState<GameState>(LS_Key, defaultState())
    const state: GameState = game.state

    const statusText: string = useMemo((): string => {
        if (state.winner === 'Draw') return 'Draw!'
        if (state.winner) {
            return `Winner: ${state.winner === player1 ? player1Name : player2Name}`
        }
        return `Turn: ${state.current === player1 ? player1Name : player2Name}`
    }, [state])

    function handleColumnClick(col: number): void {
        if (state.winner) return

        const dropped = dropInColumn(state.board, col, state.current)
        if (!dropped) return

        const lastMove = { row: dropped.row, col, player: state.current }
        const win = checkWinner(dropped.nextBoard, lastMove)
        const draw = !win && isDraw(dropped.nextBoard)

        game.push({
            board: dropped.nextBoard,
            current: win || draw ? state.current : other(state.current),
            winner: win ? win : draw ? 'Draw' : null,
            lastMove,
        })
    }

    // celebration confetti
    const lastCelebratedWinner = useRef<string | null>(null)
    useEffect(() => {
        if (state.winner && state.winner !== 'Draw') {
            if (lastCelebratedWinner.current === state.winner) return
            lastCelebratedWinner.current = state.winner

            const colors: string[] = state.winner === player1
                ? ['#e11d48', '#fb7185', '#fecdd3'] // player1 confetti colors
                : ['#1733ff', '#60a5fa', '#bfdbfe'] // player2 confetti colors

            const duration = 1200;
            const end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors,
                })
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors,
                })

                if (Date.now() < end) {
                    requestAnimationFrame(frame)
                }
            })()
        }

        // reset confetti
        if (!state.winner) {
            lastCelebratedWinner.current = null
        }
    }, [state.winner])


    return (
        <div className='main'>
            <div className="header">
                <div className="title">Connect Four</div>

                <div className="status">
                    {statusText}
                </div>
            </div>

            <div className="board-section">
                <Board
                    board={state.board}
                    lastMove={state.lastMove}
                    onColumnClick={handleColumnClick}
                />
            </div>

            <Controls
                canUndo={game.canUndo}
                onUndo={game.undo}
                onReset={() => game.reset(defaultState())}
                onClearSave={game.clear}
            />
        </div>
    )
}

export default App
