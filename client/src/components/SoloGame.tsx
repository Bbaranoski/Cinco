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
    const key: string[]= ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o',
         'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c',
         'v', 'b', 'n', 'm'];
    const [keyUsed, setKeyUsed] = useState<string[]>([])
    const [correctKey, setCorrectKey] = useState<string[]>([])

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
            if (l === secret[i])  return <span key={i} className="flex bg-green-400 px-1 w-10 h-10 rounded-md text-black justify-center items-center">{l}</span>;
            else if (secret.includes(l)) return <span key={i} className="flex bg-yellow-300 px-1 w-10 h-10 rounded-md text-black justify-center items-center">{l}</span>;
            else return <span key={i} className="flex bg-gray-300 px-1 w-10 h-10 rounded-md text-black justify-center items-center">{l}</span>;
        })
    }

    function spanKeys() {
        return key.map((l, i) => {
            if (secret.includes(l) && correctKey.includes(l)) return <span key={i} className="flex bg-green-400 px-1 w-10 h-10 rounded-md text-black justify-center items-center">{l}</span>;
            else if (secret.includes(l) && keyUsed.includes(l)) return <span key={i} className="flex bg-yellow-300 px-1 w-10 h-10 rounded-md text-black justify-center items-center">{l}</span>;
            else if (keyUsed.includes(l)) return <span key={i} className="flex bg-gray-300 px-1 w-10 h-10 rounded-md text-black justify-center items-center">{l}</span>;
            else return <span key={i} className="flex bg-purple-300 px-1 w-10 h-10 rounded-md text-black justify-center items-center">{l}</span>;
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

            <div className="m-2 flex">

            </div>
        </div>
    )
}