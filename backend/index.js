import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
app.use(cors());

app.get('/api/word/random', async (req, res) => {

    try {

        const count = await prisma.word.count();
        const randomIndex = Math.floor(Math.random() * count);
        const randomWord = await prisma.word.findMany({
            take: 1,
            skip: randomIndex,
        });
        if (!randomWord.length) {
            return res.status(404).json({ error: 'No words found.' });
        }
        res.json({ word: randomWord[0].text });

    } catch(erro) {
        console.error(erro);
        res.status(500).json({ error: 'Internal server error.' });
    }

});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`))