'use client';
import React, { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useParams } from 'next/navigation';

export default function RoomPage() {
    const { socket } = useSocket();
    const { id: roomId } = useParams();
    const [room, setRoom] = useState<any>(null);
    const [word, setWord] = useState('');
    const [guess, setGuess] = useState('');
    const [isMyTurn, setIsMyTurn] = useState(false);

    useEffect(() => {
        socket.emit('join_room', { roomId }, (res: any) => {
            if(!res.ok) alert(res.error);
        });

        socket.on('room_update', setRoom);
        socket.on('start_game', ({ starter }: any) => setIsMyTurn(socket.id === starter));
        socket.on('turn_changed', ({ current }: any) => setIsMyTurn(socket.id === current));
        socket.on('guess_result', (payload: any) => setRoom(payload.history));
        socket.on('game_over', ({ winner }: any) => alert(winner === socket.id ? 'Você venceu!' : ' Você perdeu :('));

        return () => {
            socket.off('room_update');
            socket.off('start_game');
            socket.off('turn_changed');
            socket.off('guess_result');
            socket.off('game_over');
        };
    }, [roomId, socket]);

    const submitWord = () => socket.emit('set_word', { roomId, word });
    const submitGuess = () => socket.emit('guess', { roomId, guess });

    return(
        <div>
            <h3>Sala {roomId}</h3>
            <div>Jogadores: {room?.players?.map((p: any) => p.socketId).join(', ')}</div>
            {!room?.started ? (
                <>
                <input value={word} onChange={e => setWord(e.target.value)} placeholder="Sua palavra"/>
                <button onClick={submitWord}>Enviar palavra</button>
                </>
            ) : (
                <>
                <div>{isMyTurn ? 'Sua vez!' : 'Aguardando...'} </div>
                <input disabled={!isMyTurn} value={guess} onChange={e => setGuess(e.target.value)} placeholder="Palpite"/>
                <button disabled={!isMyTurn} onClick={submitGuess}>Chutar</button>
                </>
            )}
        </div>
    );
}