import './Board.css'
import React from 'react'

export const player1 = 'R' as const
const player1Color: string = 'red'
export const player1Name: string = 'Red'
export const player2 = 'B' as const
const player2Color: string = 'blue'
export const player2Name: string = 'Blue'
export type Player = typeof player1 | typeof player2
export type Cell = Player | null

type Props = {
    board: Cell[][];
    lastMove: { row: number; col: number } | null;
    onColumnClick: (col: number) => void;
    falling: { col: number; row: number; player: Player } | null;
}

export default function Board({ board, lastMove, onColumnClick, falling }: Props) {
    return(
        <div className="board-outer">
            <div className="board-aspect">
                <div className="board">
                    {board[0].map((_, col) => (
                        <div
                            key={col}
                            className="board-col"
                            onClick={() => onColumnClick(col)}
                        >
                            {board.map((row, r) => {
                                const isLast =
                                    lastMove &&
                                    lastMove.row === r &&
                                    lastMove.col === col

                                const base = board[r][col] // existing board disc
                                const isFallingHere = falling && falling.col === col && falling.row === r
                                const visual = isFallingHere ? falling?.player : base // Show falling
                                return (
                                    <div key={r} className="board-cell">
                                        <div
                                            className={[
                                                'disc',
                                                visual === player1 ? player1Color : '',
                                                visual === player2 ? player2Color : '',
                                                isLast ? 'last' : '',
                                                isFallingHere ? 'falling' : '',
                                            ].join(' ')}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
