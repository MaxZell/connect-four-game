import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import './App.css'
import Controls from './components/Controls'
import Board, {type Cell, type Player, player1, player2, player1Name, player2Name} from './components/Board'
import { useHistoryState } from './hooks/useHistoryState'
import confetti from 'canvas-confetti'

const LS_Key = 'connect4'
const cols = 7
const rows = 6
const STEP_MS = 70

type Mode = 'pvp' | 'pve'

type GameState = {
    board: Cell[][]
    current: Player
    winner: Player | 'Draw' | null
    lastMove: { row: number; col: number; player: Player } | null
}

type Falling = {
    col: number
    row: number
    targetRow: number
    player: Player
    nextState: GameState
}

const makeEmptyBoard = (): Cell[][] =>
    Array.from({ length: rows }, () => Array(cols).fill(null))

const other = (p: Player): Player => (p === player1 ? player2 : player1)

const cloneBoard = (board: Cell[][]): Cell[][] => board.map((r) => r.slice())

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

const inBounds = (r: number, c: number) =>
    r >= 0 && r < rows && c >= 0 && c < cols

function checkWinner(
    board: Cell[][],
    last: { row: number; col: number; player: Player } | null
): Player | null {
    if (!last) return null
    const { row, col, player } = last

    const dirs = [
        { dr: 0, dc: 1 },
        { dr: 1, dc: 0 },
        { dr: 1, dc: 1 },
        { dr: 1, dc: -1 },
    ]

    for (const { dr, dc } of dirs) {
        let count = 1

        let r = row + dr,
            c = col + dc
        while (inBounds(r, c) && board[r][c] === player) {
            count++
            r += dr
            c += dc
        }

        r = row - dr
        c = col - dc
        while (inBounds(r, c) && board[r][c] === player) {
            count++
            r -= dr
            c -= dc
        }

        if (count >= 4) return player
    }
    return null
}

const isDraw = (board: Cell[][]) =>
    board[0].every((cell) => cell !== null)

const defaultState = (): GameState => ({
    board: makeEmptyBoard(),
    current: player1,
    winner: null,
    lastMove: null,
})

const validColumns = (board: Cell[][]): number[] =>
    [...Array(cols)].map((_, c) => c).filter((c) => board[0][c] === null)

const wouldWinIfPlay = (
    board: Cell[][],
    col: number,
    p: Player
): boolean => {
    const dropped = dropInColumn(board, col, p)
    if (!dropped) return false
    return !!checkWinner(dropped.nextBoard, {
        row: dropped.row,
        col,
        player: p,
    })
}

function chooseHeuristicMove(board: Cell[][], ai: Player): number | null {
    const colsList = validColumns(board)
    if (!colsList.length) return null
    const opp = other(ai)

    // win now
    for (const c of colsList)
        if (wouldWinIfPlay(board, c, ai)) return c

    // block opponent
    for (const c of colsList)
        if (wouldWinIfPlay(board, c, opp)) return c

    // prefer center
    colsList.sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3))
    return colsList[0]
}

export default function App() {
    const game = useHistoryState<GameState>(LS_Key, defaultState())
    const state = game.state

    const [mode, setMode] = useState<Mode>('pvp')
    const [falling, setFalling] = useState<Falling | null>(null)

    const human = player1
    const ai = player2

    const statusText = useMemo(() => {
        if (state.winner === 'Draw') return 'Draw!'
        if (state.winner)
            return `Winner: ${
                state.winner === player1 ? player1Name : player2Name
            }`
        if (mode === 'pve' && state.current === ai)
            return 'Computer is thinking…'
        return `Turn: ${
            state.current === player1 ? player1Name : player2Name
        }`
    }, [state, mode, ai])

    const startMove = useCallback(
        (col: number, player: Player) => {
            if (state.winner || falling) return

            const dropped = dropInColumn(state.board, col, player)
            if (!dropped) return

            const lastMove = { row: dropped.row, col, player }
            const win = checkWinner(dropped.nextBoard, lastMove)
            const draw = !win && isDraw(dropped.nextBoard)

            const nextState: GameState = {
                board: dropped.nextBoard,
                current: win || draw ? player : other(player),
                winner: win ? win : draw ? 'Draw' : null,
                lastMove,
            }

            if (dropped.row === 0) {
                game.push(nextState)
                return
            }

            setFalling({
                col,
                row: 0,
                targetRow: dropped.row,
                player,
                nextState,
            })
        },
        [
            state.board,
            state.winner,
            falling,
            game,
        ]
    )

    function handleColumnClick(col: number) {
        if (mode === 'pve' && state.current !== human) return
        startMove(col, state.current)
    }

    useEffect(() => {
        if (!falling) return

        if (falling.row >= falling.targetRow) {
            game.push(falling.nextState)
            setFalling(null)
            return
        }

        const t = window.setTimeout(() => {
            setFalling((f) => (f ? { ...f, row: f.row + 1 } : f))
        }, STEP_MS)

        return () => window.clearTimeout(t)
    }, [falling, game])

    const aiTimer = useRef<ReturnType<typeof window.setTimeout> | undefined>(undefined)

    useEffect(() => {
        if (mode !== 'pve') return
        if (state.winner || falling) return
        if (state.current !== ai) return

        aiTimer.current = window.setTimeout(() => {
            const col = chooseHeuristicMove(state.board, ai)
            if (col !== null) startMove(col, ai)
        }, 220)

        return () => {
            if (aiTimer.current !== undefined) {
                window.clearTimeout(aiTimer.current)
                aiTimer.current = undefined
            }
        }
    }, [mode, state.board, state.winner, falling, state, ai, startMove])

    const lastCelebratedWinner = useRef<Player | null>(null)

    useEffect(() => {
        if (!state.winner || state.winner === 'Draw') {
            lastCelebratedWinner.current = null
            return
        }
        if (lastCelebratedWinner.current === state.winner) return
        lastCelebratedWinner.current = state.winner

        const colors =
            state.winner === player1
                ? ['#e11d48', '#fb7185', '#fecdd3']
                : ['#1733ff', '#60a5fa', '#bfdbfe']

        const end = Date.now() + 1200
        ;(function frame() {
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
            if (Date.now() < end) requestAnimationFrame(frame)
        })()
    }, [state.winner])

    return (
        <div className="main">
            <div className="header">
                <div className="title">Connect Four</div>
                <div className="status">{statusText}</div>
            </div>

            <div className="board-section">
                <Board
                    board={state.board}
                    lastMove={state.lastMove}
                    onColumnClick={handleColumnClick}
                    falling={
                        falling
                            ? {
                                col: falling.col,
                                row: falling.row,
                                player: falling.player,
                            }
                            : null
                    }
                />
            </div>

            <Controls
                mode={mode}
                onModeChange={(m) => {
                    setMode(m)
                    game.reset(defaultState())
                }}
                canUndo={game.canUndo}
                onUndo={game.undo}
                onReset={() => game.reset(defaultState())}
                onClearSave={game.clear}
            />
        </div>
    )
}
