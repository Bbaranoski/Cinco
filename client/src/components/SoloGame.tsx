'use client';
import React, { useState, useEffect } from "react";
import { useWords, validateWord } from "@/hooks/useWords";

const MAX_TRIES = 6;

export default function SoloGame() {

    const { data: words, isLoading, isError } = useWords();
    const [secret, setSecret] = useState<string>('');
    const [guess, setGuess] = useState<string>('');
    const [history, setHistory] = useState<string[]>([]);
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
        console.log(words)
        const isValidLocally = words?.includes(guess);

        const valid = isValidLocally ?? await validateWord(guess);
        if(!valid) {
            alert('Palavra inválida!');
            return;
        }

        const nextHistory = [...history, guess];
        setHistory(nextHistory);
        setGuess('');

        if(guess === secret) setStatus('WIN');
        else if (nextHistory.length >= MAX_TRIES) setStatus('LOSE')
    };

    function getFeedback(word: string) {
        return word.split('').map((l, i) => {
            if (l === secret[i]) return <span key={i} className="bg-green-400 px-1">{l}</span>;
            else if (secret.includes(l)) return <span key={i} className="bg-yellow-300 px-1">{l}</span>;
            else return <span key={i} className="bg-gray-300 px-1">{l}</span>;
        })
    }

    if(isLoading) return <p>Carregando palavras...</p>
    if(isError) return <p>Erro ao carregar palavras.</p>

    return(
        <div>
            <div className="mb-4">
                {history.map((w, i) => <div key={i}>{getFeedback(w)}</div>)}
            </div>

            {status === 'PLAY' ? (
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input className="border px-2"
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
        </div>
    )
}