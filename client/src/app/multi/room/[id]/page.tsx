'use client';
import React, { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useParams } from 'next/navigation';
import { computeLocalStatus } from '@/lib/computeLocalStatus';

export default function RoomPage() {
    const { socket } = useSocket();
    const { id: roomId } = useParams();
    const [room, setRoom] = useState<any>(null);
    const [word, setWord] = useState('');
    const [guess, setGuess] = useState('');
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [wordSent, setWordSent] = useState(false);
    const [history, setHistory] = useState<any[]>([])

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
            console.log(payload)
            setHistory(payload.history[socket.id])});

        socket.on('game_over', ({ winner }: any) => alert(winner === socket.id ? 'Você venceu!' : ' Você perdeu :('));
            
        return () => {
            socket.off('room_update');
            socket.off('start_game');
            socket.off('turn_changed');
            socket.off('guess_result');
            socket.off('game_over');
        };
    }, [roomId]);

    const sendGuess = () => {
        if (!guess || guess.length === 0) return;
        if (!isMyTurn) {
            alert('Não é sua vez');
            return;
        }

        const guessNorm = guess.trim().toLowerCase();

        socket.emit('guess', { roomId, guess: guessNorm }, (res: any) => {
            if (!res.ok) alert(res.error || 'Erro no palpite');
            setGuess('');
        });
    };

    const submitWord = () =>{ socket.emit('set_word', { roomId, word }); console.log(room)};

    return(
        <main className="bg-stone-500 min-h-screen w-full flex items-center p-6">
            <div className='w-full h-full justify-center items-center flex'>
                <div className='fixed top-0 left-0 m-4 p-2'>
                    <h3>Sala: {roomId}</h3>
                    <div>Jogadores: {room?.players?.map((p: any) => p.socketId).join(', ')}</div>
                </div>

                {history.map((h, idx) => (
                    <div key={idx} className="flex gap-1">
                        {h.guess.split('').map((ch: string, i: number) => {
                        // computeLocalStatus poderia te dar status por posição
                        // ou usar o payload do servidor que já devolve result[]
                        const status = h.result[i];  // assumindo que servidor manda array status
                        const classes =
                            status === 'correct' ? 'bg-green-500' :
                            status === 'present' ? 'bg-yellow-400' :
                            'bg-gray-500';
                        return (
                            <span key={i} className={`px-2 py-1 ${classes}`}>{ch.toUpperCase()}</span>
                        );
                        })}
                    </div>
                ))}
                    {!wordSent && (
                        <form className='flex flex-col items-center justify-center gap-6 border rounded-2xl p-24 bg-purple-700 shadow-lg'
                            onSubmit={(e) => e.preventDefault()}>
                            <input className="border rounded-2xl p-2 w-56 min-h-[50px]
                                bg-white dark:bg-gray-800
                                focus-visible:outline-none"
                                value={word} onChange={e => setWord(e.target.value)} 
                                placeholder="Sua palavra"
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
                            <>
                            <input
                                value={guess}
                                onChange={e => setGuess(e.target.value)}
                                maxLength={room?.players?.[0]?.word?.length || 5} // ou outro tamanho definido
                                placeholder="Seu palpite"
                            />
                            <button onClick={sendGuess}>Enviar Guess</button>
                            </>
                        ) : (
                            <p>Aguardando vez do outro jogador...</p>
                        )}
                        </div>
                    )}
            </div>
        </main>
    );
}