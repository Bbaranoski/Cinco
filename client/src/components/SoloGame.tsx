'use client';
import React, { useState, useEffect, useCallback } from "react";
import { useWords, validateWord } from "@/hooks/useWords";
import { HistoryItem, LetterStatus } from "@/lib/types";
import { computeLocalStatus } from "@/lib/computeLocalStatus";
import Keyboard from "./Keyboard";

const MAX_TRIES = 6;

export default function SoloGame() {

    const { data: words, isLoading, isError } = useWords();
    const [secret, setSecret] = useState<string>('');
    const [guess, setGuess] = useState<string>('');
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [status, setStatus] = useState<'PLAY'|'WIN'|'LOSE'>('PLAY');

    useEffect(() => {
        if(words && words.length) {
            const idx = Math.floor(Math.random() * words.length);
            setSecret(words[idx]);
        }
    }, [words]);
    
    const handleKey = useCallback((k: string) => {
        if(status !== 'PLAY') return;

        setGuess(prev => {
            if(!secret) return prev
            if(prev.length >= secret.length) return prev.toLocaleUpperCase();
            return (prev + k).toLocaleUpperCase();
        });
    }, [secret, status])

    const handleBackspace = useCallback(() => {
        if(status !== 'PLAY') return;
        setGuess(prev => prev.slice(0, -1));
    }, [status]);

    const handleEnter = useCallback(async () => {
        if(status !== 'PLAY') return;
        const g = guess.trim().toLocaleLowerCase();
        if(!g || g.length !== secret.length) {
            return;
        }
        const isValidLocally = words?.includes(g);

        const valid = isValidLocally ?? await validateWord(g);
        if(!valid) {
            alert('Palavra inválida!');
            return;
        }

        const statuses = computeLocalStatus(secret, g);
        const newItem: HistoryItem = { word: g, status: statuses };

        setHistory(prev => {
            const nh = [...prev, newItem];
            if(nh.length >= MAX_TRIES) {
                const lastWon = statuses.every(s => s === 'correct');
                if(!lastWon) {
                    setStatus('LOSE')
                }
            }
            return nh;
        });

        const won = statuses.every(s => s === 'correct');
        if(won) setStatus('WIN');

        setGuess('');

    }, [guess, secret, status]);

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if(status !== 'PLAY') return;

            const k = e.key;
            if(k === 'Backspace') {
                e.preventDefault();
                handleBackspace();
                return;
            }
            if(k === 'Enter') {
                e.preventDefault();
                void handleEnter();
                return;
            }
            if(/^[a-zA-Z]$/.test(k)) {
                e.preventDefault();
                handleKey(k.toUpperCase());
            }
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [handleBackspace, handleEnter, handleKey, status]);

    if(isLoading) return <p>Carregando palavras...</p>
    if(isError) return <p>Erro ao carregar palavras.</p>

    return(
        <div className="flex flex-col justify-around h-full">
            <div className="mb-4 h-100 flex flex-col items-center">
                {history.map((item, i) => (
                    <div key={i} className="flex justify-center gap-1 mb-1">
                        {item.word.split('').map((ch, idx) => {
                            const s: LetterStatus = item.status[idx];
                            const classes =
                                s === 'correct' ? 'bg-green-400 text-white' :
                                s === 'present' ? 'bg-yellow-300 text-black' :
                                s === 'absent'  ? 'bg-gray-400 text-black' :
                                'bg-gray-200 text-black';
                            return (
                                <span key={idx} className={`px-2 py-1 rounded-md w-10 h-10 flex items-center justify-center border border-black ${classes}`}>
                                    {ch.toUpperCase()}
                                </span>
                            );
                        })}
                    </div>
                ))}

                {status === 'WIN' && <p className="mt-4 text-green-600">Você ganhou! A palavra era <strong>{secret.toUpperCase()}</strong>.</p>}
                {status === 'LOSE' && <p className="mt-4 text-red-600">Você perdeu… A palavra era <strong>{secret.toUpperCase()}</strong>.</p>}

            </div>

            <div>
                <form onSubmit={(e) => { e.preventDefault(); void handleEnter(); }} className="flex justify-center">
                    <input
                        value={guess}
                        onChange={e => {
                            const val = e.target.value.replace(/[^a-zA-Z]/g, '').toLowerCase();
                            if (secret && val.length > secret.length) return;
                            setGuess(val);
                        }}
                        maxLength={secret.length}
                        className="border border-black rounded-md px-2 py-1"
                        placeholder={`Palpite (${secret ? secret.length : '-' } letras)`}
                        disabled={status !== 'PLAY'}
                    />
                </form>
                
                <Keyboard
                    history={history}
                    secret={secret}
                    onKey={(k) => handleKey(k)}
                    onBackspace={() => handleBackspace()}
                    onEnter={() => void handleEnter()}
                    disabled={status !== 'PLAY'}
                />
            </div>

        </div>
    )
}