import { Server, Socket } from 'socket.io';

interface Player {
    id: string;
    socketId: string;
    ready: boolean;
    word?: string;
}

interface GameRoom {
    id: string;
    players: Player[];
    turnIndex: number;
    history: Record<string, { guess: string, result: string[] } []>
}

const rooms = new Map<string, GameRoom>();
let nextRoomId = 1;

export default function setupSocket(io: Server) {
    io.on('connection', (socket) => {
        console.log('Nove cliente conectado:', socket.id);

        socket.on('create_room', (callback: (res: any) => void) => {
            const roomId = String(nextRoomId++);
            const playerId = socket.id;

            const room: GameRoom = {
                id: roomId,
                players: [{ id: playerId, socketId: socket.id, ready: false }],
                turnIndex: 0,
                history: {},
            };

            rooms.set(roomId, room);
            socket.join(roomId);
            callback({ ok: true, roomId });
        });

        socket.on('join_room', ({ roomId }, callback: (res: any) => void) => {
            const room = rooms.get(roomId);
            if (!room) return callback({ok: false, error: 'Sala não encontrada' });
            if (room.players.length >= 2) return callback({ ok: false, error: 'Sala cheia' });

            room.players.push({ id: socket.id, socketId: socket.id, ready: false });
            room.history[socket.id] = [];
            socket.join(roomId);
            callback({ ok: true, roomId });
            io.to(roomId).emit('room_update', room);
        });

        socket.on('set_word', ({ roomId, word }, callback: (res: any) => void) => {
            const room = rooms.get(roomId);
            if (!room) return callback({ ok: false, error: 'Sala não encontrada' });

            const player = room.players.find((p) => p.socketId === socket.id);
            if (!player) return callback({ ok: false, error: 'Jogador não esta na sala' });

            player.word = word.trim().toLowerCase();
            player.ready = true;

            io.to(roomId).emit('room_update', room);

            if (room.players.length === 2 && room.players.every((p) => p.ready)) {
                const starter = room.players[room.turnIndex].socketId;
                io.to(roomId).emit('start_game', { starter });
            }

            callback({ ok: true });
        });

        socket.on('guess', ({ roomId, guess }, callback: (res: any) => void) => {
            const room = rooms.get(roomId);
            if (!room) return callback({ ok: false, error: 'Sala não encontrada' });

            const index = room.turnIndex;
            const currentPlayer = room.players[index];
            if (socket.id !== currentPlayer.socketId) return callback({ ok: false, error: 'Não é sua vez' });

            const opponent = room.players[1 - index];
            if (!opponent.word) return callback({ ok: false, error: 'Adversário não definiu a palavra' });

            const result = guess.split('').map((ch, idx) => (ch === opponent.word![idx] ? 'correct' : 'wrong'));

            room.history[socket.id].push({ guess, result });

            io.to(roomId).emit('guess_result', {
                by: socket.id,
                guess,
                result,
                history: room.history,
            });

            const isWin = result.every((r) => r === 'correct');
            if (isWin) {
                io.to(roomId).emit('game_over', { winner: socket.id });
                return callback({ ok: true, win: true})
            }

            room.turnIndex = 1 -index;
            io.to(roomId).emit('turn_changed', { current: room.players[room.turnIndex].socketId})
        })
    })
    
}