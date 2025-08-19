import { LetterStatus, HistoryItem } from "./types";

export function buildLetterStatusFromHistory(history: HistoryItem[]): Map<string, LetterStatus> {
    const statuses = new Map<string, LetterStatus>();

    for (const item of history) {
        const word = item.word;
        const statusArr = item.status;
        for (let i = 0; i < word.length; i ++) {
            const ch = word[i];
            const newStatus = statusArr[i];
            const existing = statuses.get(ch) ?? 'unknown';

            if (existing === 'correct') continue;
            if (newStatus === 'correct') statuses.set(ch, 'correct');
            else if (newStatus === 'present' && existing !== 'present') statuses.set(ch, 'present');
            else if (newStatus === 'absent' && existing === 'unknown') statuses.set(ch, 'absent');
        }
    }

    return statuses;
}