import { LetterStatus } from "./types";

export function computeLocalStatus(secretRow: string, guessRaw: string): LetterStatus[] {
    const secret = (secretRow ?? '').trim().toLowerCase();
    const guess = (guessRaw ?? '').trim().toLowerCase();
    const len = Math.max(secret.length, guess.length);

    const counts: Record<string, number> = {};
    for (let i = 0; i < secret.length; i++) {
        const ch = secret[i];
        counts[i] = (counts[ch] ?? 0) + 1;
    }

    const localStatus: LetterStatus[] = new Array(guess.length).fill('unknown');

    for (let i = 0; i < guess.length; i++) {
        const g = guess[i];
        if (secret[i] === g) {
            localStatus[i] = 'correct';
            counts[g] = (counts[g] ?? 1) - 1;
        }
    }

    for (let i = 0; i < guess.length; i ++){
        if (localStatus[i] === 'correct') continue
        const g = guess[i];
        if ((counts[g] ?? 0) > 0){
            localStatus[i] = 'present';
            counts[g] -= 1
        } else {
            localStatus[i] = 'absent';
        }
    }

    return localStatus;
}