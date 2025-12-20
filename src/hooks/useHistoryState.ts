import { useEffect, useState } from 'react'

export function useHistoryState<T>(key: string, initial: T) {
    const [history, setHistory] = useState<T[]>(() => {
        const raw: string = localStorage.getItem(key)
        if (!raw) return [initial]
        try {
            const parsed: (T)[] = JSON.parse(raw) as T[]
            if (!Array.isArray(parsed) || parsed.length === 0) return [initial]
            return parsed
        } catch {
            return [initial]
        }
    })

    const state: T = history[history.length - 1]

    useEffect((): void => {
        localStorage.setItem(key, JSON.stringify(history))
    }, [key, history])

    function push(next: T): void {
        setHistory((h: (T)[]) => [...h, next])
    }

    function undo(): void {
        setHistory((h: (T)[]): (T)[] => (h.length > 1 ? h.slice(0, -1) : h))
    }

    function reset(next?: T): void {
        setHistory([next ?? initial])
    }

    function clear(): void {
        localStorage.removeItem(key)
        setHistory([initial])
    }

    return {
        history,
        state,
        canUndo: history.length > 1,
        push,
        undo,
        reset,
        clear,
        setHistory
    }
}
