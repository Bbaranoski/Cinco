import express, { Application } from 'express';
import http from 'http'
import { Server as IoServer } from 'socket.io';
import cors from 'cors';
import { wordRouter } from './routes/word.routes';
import setupSocket from './socket';

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 3333;

app.use(cors());
app.use(express.json());
app.use('/api/words', wordRouter);

const httpServer = http.createServer(app);

const io = new IoServer(httpServer, {
   cors: { origin: '*', methods: ['GET', 'POST'] }, 
});

setupSocket(io);

httpServer.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
})