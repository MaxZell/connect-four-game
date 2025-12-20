import './Controls.css'

type Mode = 'pvp' | 'pve'

type Props = {
    canUndo: boolean;
    onUndo: () => void;
    onReset: () => void;
    onClearSave: () => void;
    mode: Mode
    onModeChange: (m: Mode) => void
}

export default function Controls({ canUndo, onUndo, onReset, onClearSave, mode, onModeChange }: Props) {
    return(
        <div className="controls">
            <button onClick={onUndo} disabled={!canUndo}>Undo</button>
            <button onClick={onReset}>Reset</button>
            <button className="secondary" onClick={onClearSave}>Clear Save</button>
            <div className="mode-toggle" role="group" aria-label="Game mode">
                <button
                    type="button"
                    className={`mode-btn ${mode === 'pvp' ? 'active' : ''}`}
                    onClick={() => onModeChange('pvp')}
                    title="PvP: two players on the same device"
                >
                    👤
                </button>
                <button
                    type="button"
                    className={`mode-btn ${mode === 'pve' ? 'active' : ''}`}
                    onClick={() => onModeChange('pve')}
                    title="PvE: play against the computer"
                >
                    🤖
                </button>
            </div>
        </div>
    )
}
