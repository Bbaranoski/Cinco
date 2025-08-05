import express, { Application } from 'express';
import cors from 'cors';
import { wordRouter } from './routes/word.routes';

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 3333;

app.use(cors());
app.use(express.json());
app.use('/api/words', wordRouter);

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));""