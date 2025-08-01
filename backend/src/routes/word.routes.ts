import { Router } from "express";
import { getAllWords, getRandomWord, addWord, deleteWordById} from '../controllers/word.controller';

export const wordRouter = Router();

wordRouter.get('/', getAllWords);
wordRouter.get('/random', getRandomWord);
wordRouter.post('/', addWord)
wordRouter.delete('/:id', deleteWordById);
