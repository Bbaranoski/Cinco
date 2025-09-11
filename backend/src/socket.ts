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

function computeResult(secretRaw: string, guessRaw: string): string[] {
  const secret = (secretRaw ?? '').trim().toLowerCase();
  const guess = (guessRaw ?? '').trim().toLowerCase();
  const len = Math.max(secret.length, guess.length);
  const result: string[] = new Array(guess.length).fill('absent');

  const counts: Record<string, number> = {};
  for (let i = 0; i < secret.length; i++) counts[secret[i]] = (counts[secret[i]] ?? 0) + 1;

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] && secret[i] === guess[i]) {
      result[i] = 'correct';
      counts[guess[i]] = (counts[guess[i]] ?? 1) - 1;
    }
  }

  for (let i = 0; i < guess.length; i++) {
    if (result[i] === 'correct') continue;
    const ch = guess[i];
    if (!ch) { result[i] = 'absent'; continue; }
    if ((counts[ch] ?? 0) > 0) {
      result[i] = 'present';
      counts[ch] -= 1;
    } else {
      result[i] = 'absent';
    }
  }

  return result;
}

export default function setupSocket(io: Server) {
    io.on('connection', (socket: Socket) => {
        console.log('Nove cliente conectado:', socket.id);

        socket.on('create_room', (callback?: (res: any) => void) => {
            const roomId = String(nextRoomId++);
            const playerId = socket.id;

            const room: GameRoom = {
                id: roomId,
                players: [{ id: playerId, socketId: socket.id, ready: false }],
                turnIndex: 0,
                history: {},
            };

            room.history[socket.id] = []

            rooms.set(roomId, room);
            socket.join(roomId);

            callback?.({ ok: true, roomId });
            io.to(roomId).emit('room_update', room);
        });

        socket.on('join_room', ({ roomId }, callback?: (res: any) => void) => {
            const room = rooms.get(roomId);

            if (!room) return callback?.({ok: false, error: 'Sala não encontrada' });

            const already = room.players.some(p => p.socketId === socket.id);
            if (already) {
                return callback?.({ ok: true, message: 'Você já está na sala'});
            }

            if (room.players.length >= 2) return callback?.({ ok: false, error: 'Sala cheia' });

            room.players.push({ id: socket.id, socketId: socket.id, ready: false });
            room.history[socket.id] = [];
            socket.join(roomId);

            callback?.({ ok: true, roomId });
            io.to(roomId).emit('room_update', room);
        });

        socket.on('set_word', ({ roomId, word }, callback?: (res: any) => void) => {
            const room = rooms.get(roomId);
            console.log(word)
            if (!room) return callback?.({ ok: false, error: 'Sala não encontrada' });

            const player = room.players.find((p) => p.socketId === socket.id);
            if (!player) return callback?.({ ok: false, error: 'Jogador não esta na sala' });

            if(!word || typeof word !== 'string') return callback?.({ ok: false, error: 'Palavra invalda' });

            player.word = word.trim().toLowerCase();
            player.ready = true;

            io.to(roomId).emit('room_update', room);

            if (room.players.length === 2 && room.players.every((p) => p.ready)) {
                const starter = room.players[room.turnIndex].socketId;
                console.log(starter)
                io.to(roomId).emit('start_game', { starter });
            }

            callback?.({ ok: true });
        });

        socket.on('guess', async ({ roomId, guess } : { roomId: string; guess: string}, callback?: (res: any) => void) => {
            const room = rooms.get(roomId);
            if (!room) return callback?.({ ok: false, error: 'Sala não encontrada' });

            const index = room.turnIndex;
            const currentPlayer = room.players[index];
            if (!currentPlayer) return callback?.({ ok: false, error: 'Turno invalido' })

            if (socket.id !== currentPlayer.socketId) return callback?.({ ok: false, error: 'Não é sua vez' });

            const opponent = room.players.find((p) => p.socketId !== socket.id);
            if (!opponent) return callback?.({ ok: false, error: 'Adversário não encontrado' })
            if (!opponent.word) return callback?.({ ok: false, error: 'Adversário não definiu a palavra' });

            if(!guess || typeof guess !== 'string') return callback?.({ ok: false, error: 'Palpite invalido' })
            
            const guessNorm = guess.trim().toLowerCase();

            const result = computeResult(opponent.word!, guessNorm);

            room.history[socket.id] = room.history[socket.id] ??[];
            room.history[socket.id].push({ guess: guessNorm, result });

            io.to(roomId).emit('guess_result', {
                by: socket.id,
                guess: guessNorm,
                result,
                history: room.history,
            });

            const isWin = result.every((r) => r === 'correct');
            if (isWin) {
                io.to(roomId).emit('game_over', { winner: socket.id });
                return callback?.({ ok: true, win: true})
            }

            room.turnIndex = 1 -index;
            io.to(roomId).emit('turn_changed', { current: room.players[room.turnIndex].socketId });
            callback?.({ ok: true });
        });

        socket.on('disconnect', () => {
            for (const [roomId, room] of Array.from(rooms.entries())) {
                const idx = room.players.findIndex((p) => p.socketId === socket.id);
                if (idx !== -1) {
                    delete room.history[socket.id];
                    const removed = room.players.slice(idx, 1)[0];

                    io.to(roomId).emit('player_left', { socketId: socket.id, player: removed, room });

                    if (room.players.length === 0) {
                        rooms.delete(roomId);
                    } else {
                        room.turnIndex = 0;
                        io.to(roomId).emit('room_update', room);
                    }
                    break;
                }
            }
            console.log('Cliente desconectado', socket.id);
        });
    });
    
}