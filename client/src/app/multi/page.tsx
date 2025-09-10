'use client';
import React, { useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useRouter } from "next/navigation";

export default function MultiLobby() {
    const { socket, connected } = useSocket();
    const router = useRouter();
    const [roomId, setRoomId] = useState('');

    function createRoom() {
        socket.emit('create-room', (res: any) => {
            if (res?.roomId) router.push(`/multi/room/${res.roomId}`)
        });
    }

    function joinRoom() {
        socket.emit('join_room', { roomId }, (res: any) => {
            if (res?.ok) router.push(`/multi/room/${roomId}`);
            else alert(res.error || 'Erro ao entrar');
        });
    }

    return (
        <div>
            <h2>Multiplayer Lobby {connected ? '🟢' : '🔴'}</h2>
            <input value={roomId}
                onChange={e => setRoomId(e.target.value)}
                placeholder="Código da sala"
            />
            <button onClick={joinRoom}>Entrar</button>
            <button onClick={createRoom}>Criar Sala</button>
        </div>
    );
}