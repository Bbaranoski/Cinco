import { LetterStatus, HistoryItem } from "./types";

export function buildLetterStatus(history: HistoryItem[]): Map<string, LetterStatus> {
    const statuses = new Map<string, LetterStatus>();

    for (const rawGuess of history) {
        const guess = (rawGuess ?? '').trim().toLowerCase();
        if(!guess) continue;

        const counts: Record<string, number> = {}; 
        for(let i = 0; i < normSecret.length; i++) {
            const ch = normSecret[i];
            counts[ch] = (counts[ch] ?? 0) + 1;
        }

        const localStatus: LetterStatus[] = new Array(guess.length).fill('unknown');
        for (let i = 0; i < guess.length; i++) {
            const g = guess[i];
            if(normSecret[i] === g) {
                localStatus[i] = 'correct';
                counts[g] = (counts[g] ?? 1) - 1;
            }
        }

        for (let i = 0; i < guess.length; i++) {
            if(localStatus[i] === 'correct') continue;
            const g = guess[i];
            if((counts[g] ?? 0) > 0) {
                localStatus[i] = 'present';
                counts[g] -= 1;
            } else {
                localStatus[i] = 'absent';
            }
        }

        for (let i = 0; i < guess.length; i ++) {
            const ch = guess[i];
            const newStatus = localStatus[i];

            const existing = statuses.get(ch) ?? 'unknown';

            if (existing === 'correct') continue;
            if (newStatus === 'correct') {
                statuses.set(ch, 'correct');
            } else if (newStatus === 'present' && existing !== 'present') {
                statuses.set(ch, 'present');
            } else if (newStatus === 'absent' && existing === 'unknown') {
                statuses.set(ch, 'absent');
            }
        }
    }

    return statuses;
}