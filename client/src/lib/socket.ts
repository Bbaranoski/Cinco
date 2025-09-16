import { io, Socket } from 'socket.io-client';

const URL = 'http://BRENO:3333';

const socket: Socket = io(URL, {
    autoConnect: true,
});

export default socket;