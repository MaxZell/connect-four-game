import './Board.css'

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
}

export default function Board({ board, lastMove, onColumnClick }: Props) {
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

                                return (
                                    <div key={r} className="board-cell">
                                        <div
                                            className={`disc ${
                                                row[col] === player1
                                                    ? player1Color
                                                    : row[col] === player2
                                                        ? player2Color
                                                        : ''
                                            } ${isLast ? 'last' : ''}`}
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
