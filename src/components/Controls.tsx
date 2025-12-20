import './Controls.css'

type Props = {
    canUndo: boolean;
    onUndo: () => void;
    onReset: () => void;
    onClearSave: () => void;
}

export default function Controls({ canUndo, onUndo, onReset, onClearSave }: Props) {
    return(
        <div className="controls">
            <button onClick={onUndo} disabled={!canUndo}>Undo</button>
            <button onClick={onReset}>Reset</button>
            <button className="secondary" onClick={onClearSave}>Clear Save</button>
        </div>
    )
}
