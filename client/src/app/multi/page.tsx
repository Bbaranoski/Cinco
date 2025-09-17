'use client';
import React, { useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useRouter } from "next/navigation";

export default function MultiLobby() {
    const { socket, connected } = useSocket();
    const router = useRouter();
    const [roomId, setRoomId] = useState('');

    function createRoom() {
        socket.emit('create_room', (res: any) => {
            console.log(res) 
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
        <main className="bg-stone-500 min-h-screen w-full flex items-center p-6">
            <div className="max-w-5xl w-full flex flex-col items-center gap-4">
                <h2 className="text-4xl font-bold mb-2">Multiplayer Lobby</h2>
                    <form  onSubmit={(e) => e.preventDefault()}
                        className="gap-4 flex flex-col items-center"
                    >
                        <input className="border rounded-2xl p-2 w-56 min-h-[50px]
                        bg-white dark:bg-gray-800
                        focus-visible:outline-none"
                        value={roomId}
                        onChange={e => setRoomId(e.target.value)}
                        placeholder="Código da sala"
                         />
                        <button className="border rounded-2xl p-4 w-48 min-h-[50px]
                            transition-transform transform hover:-translate-y-1 hover:shadow-lg
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-white dark:bg-gray-800" 
                            onClick={joinRoom}>Entrar</button>
                    </form>

                <button className="border rounded-2xl p-4 w-48 min-h-[50px]
                    transition-transform transform hover:-translate-y-1 hover:shadow-lg
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-white dark:bg-gray-800"
                    onClick={createRoom}>Criar Sala</button>
                
                <p> Status{connected ? '🟢' : '🔴'}</p>
            </div>
            <img className="pl-56" src="catTongue.jpg" alt="cato" />
        </main>
    );
}