import { PrismaClient, Word } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();

export async function getAllWords(req: Request, res: Response) {
    try {
        const words: Word[] = await prisma.word.findMany({ orderBy: {id: 'asc' } });
        res.json(words);
    } catch(erro) {
        console.error(erro);
        res.status(500).json({ error: 'Failed to fetch words.' });
    }
}

export async function getRandomWord(req: Request, res: Response) {
    try {
        const count: number = await prisma.word.count();
        if(count === 0) return res.status(404).json({ error: 'No words found.' });
        const randomIndex = Math.floor(Math.random() * count);
        const [word]: Word[] = await prisma.word.findMany({ take: 1, skip: randomIndex });
        res.json({ word: word.text })
    } catch(erro) {
        console.error(erro);
        res.status(500).json({ error: 'Internal server error.' })
    }
}

export async function addWord(req: Request, res: Response) {
    const { text }: { text?: string } = req.body;
    if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'Invalid word text.' });
        return;
    }
    try {
        const newWord: Word = await prisma.word.create({ data: { text } });
        res.status(201).json(newWord);
    } catch(erro) {
        console.error(erro)
        res.status(500).json({ error: 'Failed to add Word.' });
    }
}

export async function deleteWordById(req: Request, res: Response){
    const id: number = Number(req.params.id);
    if(isNaN(id)) {
        res.status(400).json({ error: 'Invalid ID.' })
        return;
    }
    try { 
        await prisma.word.delete({ where: { id } })
        res.status(204).end();
    } catch(erro) {
        console.error(erro)
        res.status(500).json({ error: 'Failed to delete word.' })
    }
}

export async function findWord(req: Request, res: Response) {
    try {
        const { word } = req.query;
        if(!word || typeof word !== 'string'){
            return res.status(400).json({ valid: false, error: 'Parâmetro word ausente' });
        }
        const exists = await prisma.word.findUnique({ where: { text: word.toLowerCase() } });
        return res.json({ valid: Boolean(exists) });
    } catch(erro) {
        console.error(erro);
        res.status(500).json({ valid: false, error: 'Erro no servidor' });
    }
};