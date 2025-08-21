'use client';
import React, { useMemo } from "react";
import { buildLetterStatusFromHistory } from "@/lib/letterStatus";
import { HistoryItem, LetterStatus } from "@/lib/types";

type Props = {
    history: HistoryItem[];
    secret: string;
    onKey: (k: string) => void;
    onBackspace: () => void;
    onEnter: () => void;
    disabled?: boolean;
}

const KEYS = [
    'q','w','e','r','t','y','u','i','o','p',
    'a','s','d','f','g','h','j','k','l',
    'z','x','c','v','b','n','m'
];

function clsForStatus(status?: LetterStatus) {
    switch (status) {
        case 'correct': return 'bg-green-400 text-white';
        case 'present': return 'bg-yellow-300 text-black';
        case 'absent':  return 'bg-gray-400 text-black';
        default:        return 'bg-gray-200 text-black';
   }
}

export default function Keyboard({ history, secret, onKey, onBackspace, onEnter, disabled }: Props) {
    const status = useMemo(() => buildLetterStatusFromHistory(history), [history]);

    return (
        <div className="w-full mt-6 select-none">
            <div className="felx justify-center gap-1 md-2">
                {KEYS.slice(0, 10).map(k => (
                    <button key={k} className={`px-2 py-2 m-1 rounded-md w-10 h-10 ${clsForStatus(status.get(k))}`}
                        onClick={() => !disabled && onKey(k)}
                        disabled={disabled}
                        aria-label={`Tecla ${k}`}
                        type="button"
                    >
                        {k.toUpperCase()}
                    </button>
                ))}
            </div>
            <div className="pl-5 felx justify-center gap-1 md-2">
                {KEYS.slice(10, 19).map(k => (
                    <button key={k} className={`px-2 py-2 m-1 rounded-md w-10 h-10 ${clsForStatus(status.get(k))}`}
                        onClick={() => !disabled && onKey(k)}
                        disabled={disabled}
                        aria-label={`Tecla ${k}`}
                        type="button"
                    >
                        {k.toUpperCase()}
                    </button>
                ))}
            </div>
            <div className="pl-10 felx justify-center gap-1 md-2">
                {KEYS.slice(19).map(k => (
                    <button key={k} className={`px-2 py-2 m-1 rounded-md w-10 h-10 ${clsForStatus(status.get(k))}`}
                        onClick={() => !disabled && onKey(k)}
                        disabled={disabled}
                        aria-label={`Tecla ${k}`}
                        type="button"
                    >
                        {k.toUpperCase()}
                    </button>
                ))}
                <button
                    onClick={() => !disabled && onEnter()}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white"
                    type="button"
                    disabled={disabled}
                >
                    Enter
                </button>
            </div>
        </div>
    )
}