export type LetterStatus  = 'correct' | 'present' | 'absent' | 'unknown';

export type HistoryItem = {
    word: string;
    status: LetterStatus[];
};