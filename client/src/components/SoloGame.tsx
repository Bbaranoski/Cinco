'use client';
import React, { useState, useEffect } from "react";
import { useWords, validateWord } from "@/hooks/useWords";
import { HistoryItem, LetterStatus } from "@/lib/types";
import { computeLocalStatus } from "@/lib/computeLocalStatus";
import Keyboard from "./Keyboard";

const MAX_TRIES = 6;

export default function SoloGame({ word }: { word: string[] }) {

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
    
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if(status !== 'PLAY') return;
        const g = guess.trim().toLowerCase();
        console.log(secret)
        const isValidLocally = words?.includes(g);

        const valid = isValidLocally ?? await validateWord(g);
        if(!valid) {
            alert('Palavra inválida!');
            return;
        }

        const statuses = computeLocalStatus(secret, g);

        const newItem: HistoryItem = { word: g, status: statuses };
        setHistory(prev => [...prev, newItem]);
        setGuess('');

        const won = statuses.every( s => s === 'correct');
        if (won) setStatus('WIN');
        else if (history.length + 1 >= MAX_TRIES) setStatus('LOSE')
    };

    function getFeedback(word: string) {
        return word.split('').map((l, i) => {
            if (l === secret[i])  return <span key={i} className="flex bg-green-400 px-1 w-10 h-10 rounded-md text-black justify-center items-center">{l.toUpperCase()}</span>;
            else if (secret.includes(l)) return <span key={i} className="flex bg-yellow-300 px-1 w-10 h-10 rounded-md text-black justify-center items-center">{l.toUpperCase()}</span>;
            else return <span key={i} className="flex bg-gray-400 px-1 w-10 h-10 rounded-md text-black justify-center items-center">{l.toUpperCase()}</span>;
        })
    }

    if(isLoading) return <p>Carregando palavras...</p>
    if(isError) return <p>Erro ao carregar palavras.</p>

    return(
        <div>
            <div className="mb-4">
                {history.map((w, i) => <div className="flex p-2 gap-2"
                key={i}>{getFeedback(w)}</div>)}
            </div>

            {status === 'PLAY' ? (
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input className="border px-2"
                        type="text"
                        value={guess}
                        onChange={e => setGuess(e.target.value.trim().toLowerCase())}
                        maxLength={secret.length}
                        placeholder={`Palpite (${secret.length} letras)`}
                        required
                    />
                    <button type="submit" className="bg-blue-500 text-white px-3">Chutar</button>
                </form>
            ) : (
                <div className="mt-4">
                    {
                        status === 'WIN' ?
                            <p className="text-green-600">Você ganhou! A palavra era <strong>{secret}</strong>.</p> :
                            <p className="text-red-600">Você perdeu… A palavra era <strong>{secret}</strong>.</p>
                    }
                    <button className="mt-2 underline"
                        onClick={() => window.location.reload()}
                    >Jogar de novo</button>
                </div>
            )}

            <Keyboard history={history} secret={secret}/>

        </div>
    )
}