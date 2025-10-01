'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useParams } from 'next/navigation';
import { computeLocalStatus } from '@/lib/computeLocalStatus';
import { useWords, validateWord } from '@/hooks/useWords';
import Link from 'next/link';

export default function RoomPage() {
    const { socket } = useSocket();
    const { id: roomId } = useParams();
    const { data: words, isLoading, isError } = useWords();
    const [room, setRoom] = useState<any>(null);
    const [word, setWord] = useState('');
    const [guess, setGuess] = useState('');
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [wordSent, setWordSent] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        socket.emit('join_room', { roomId }, (res: any) => {
            if(!res.ok) alert(res.error);
        });

        socket.on('room_update', (roomState: any) => setRoom(roomState));

        socket.on('start_game', ({ starter }: any) => {
            setIsMyTurn(socket.id === starter);
            setWordSent(true);
        });

        socket.on('turn_changed', ({ current }: any) => setIsMyTurn(socket.id === current));

        socket.on('guess_result', (payload: any) => { 
            setHistory(payload.history)
        });

        socket.on('game_over', ({ winner }: any) => alert(winner === socket.id ? 'Você venceu!' : ' Você perdeu :('));
            
        return () => {
            socket.off('room_update');
            socket.off('start_game');
            socket.off('turn_changed');
            socket.off('guess_result');
            socket.off('game_over');
        };
    }, [roomId]);

    const sendGuess = async () => {
        if (!guess || guess.length === 0) return;
        if (!isMyTurn) {
            alert('Não é sua vez');
            return;
        }

        const secret = guess.trim().toLocaleLowerCase();
        const isValidLocally = words?.includes(secret);
        const valid = isValidLocally ?? await validateWord(secret);

        if (!valid) {
            alert('Palavra invalida');
            return;
        }

        socket.emit('guess', { roomId, guess: secret }, (res: any) => {
            if (!res.ok) alert(res.error || 'Erro no palpite');
            
            setGuess('');
        });
    };

    const submitWord = async () =>{ 
        if (wordSent) return;

        const secret = word.trim().toLocaleLowerCase();
        const isValidLocally = words?.includes(secret);
        const valid = isValidLocally ?? await validateWord(secret);

        if (!valid) {
            alert('Palavra invalida');
            return;
        }

        socket.emit('set_word', { roomId, word }) 

        setWord('');

        alert('Palavra enviada')
    };

    const handleKey = useCallback((k: string) => {
        if(!isMyTurn) return;
    
        setGuess(prev => {
            if(!wordSent) return prev
            if(prev.length >= word.length) return prev.toLocaleUpperCase();
            return (prev + k).toLocaleUpperCase();
        });
    }, [wordSent, isMyTurn])

    const handleBackspace = useCallback(() => {
            if(!isMyTurn) return;
            setGuess(prev => prev.slice(0, -1));
        }, [isMyTurn]);

    return(
        <main className="bg-stone-500 min-h-screen w-full flex items-center p-6">
            <div className='w-full h-full justify-center items-center flex flex-col gap-4'>
                <div className='fixed top-0 left-0 m-4 p-2'>
                    <h3>Sala: {roomId}</h3>
                    <div>Jogadores: {room?.players?.map((p: any) => p.socketId).join(', ')}</div>
                </div>
                <div className='flex gap-20'>
                    {room && room.players && room.players.length > 0 && wordSent && (
                        room.players.map((p: any) => 
                            <div className='flex flex-col gap-4'
                                key={p.socketId}
                            >
                                <h2>{p.socketId === socket.id ? 'Você' : 'Ele'}</h2>
                                {(history[p.socketId] ?? []).map((h: any, idx: any) => (
                                    <div key={idx} className="flex gap-1">
                                        {h.guess.split('').map((ch: string, i: number) => {
                                            
                                            const s = h.result[i]; 
                                            const classes =
                                                s === 'correct' ? 'bg-green-400 text-white' :
                                                s === 'present' ? 'bg-yellow-300 text-black' :
                                                s === 'absent'  ? 'bg-gray-400 text-black' :
                                                'bg-gray-200 text-black';
                                            return (
                                                <span key={i} className={`px-2 py-1 rounded-md w-10 h-10 flex items-center justify-center border border-black ${classes}`}>
                                                    {ch.toUpperCase()}</span>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
                

                {!wordSent &&(
                    <form className='flex flex-col items-center justify-center gap-6 border rounded-2xl p-24 bg-white-700 shadow-lg'
                        onSubmit={(e) => e.preventDefault()}>
                        <input className="border rounded-2xl p-2 w-56 min-h-[50px]
                            bg-white dark:bg-gray-800
                            focus-visible:outline-none"
                            value={word} onChange={e => setWord(e.target.value)} 
                            placeholder="Sua palavra"
                            maxLength={5}
                        />
                        <button className="border rounded-2xl p-4 w-48 min-h-[50px]
                            transition-transform transform hover:-translate-y-1 hover:shadow-lg
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-white dark:bg-gray-800" 
                            onClick={submitWord}>Enviar palavra</button>
                    </form>
                )}

                {wordSent && (
                    <div>
                    {isMyTurn ? (
                        <form onSubmit={e => e.preventDefault()}
                        >
                            <input className='border rounded-2xl p-2 w-56 min-h-[25px]
                                bg-white dark:bg-gray-800
                                focus-visible:outline-none'
                                value={guess}
                                onChange={e => setGuess(e.target.value)}
                                maxLength={room?.players?.[0]?.word?.length || 5}
                                placeholder="Seu palpite"
                            />

                            <button onClick={sendGuess}>Enviar Guess</button>
                        </form>
                    ) : (
                        <p>Aguardando vez do outro jogador...</p>
                    )}
                    </div>
                )}
                <Link href="/multi" className='fixed bottom-0 m-4 p-2 text-indigo-600 '>Voltar ao lobby</Link>
            </div>
        </main>
    );
}