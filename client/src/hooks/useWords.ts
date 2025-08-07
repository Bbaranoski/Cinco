import { useQuery } from "@tanstack/react-query";

async function fetchWords(): Promise<string[]> {
    const res = await fetch('http://BRENO:3333/api/words');
    if(!res.ok) throw new Error('Falha ao buscar palavras');
    const data: { id: number; text: string }[] = await res.json()
    return data.map(item => item.text.trim().toLowerCase())
}

export function useWords() {
    return useQuery<string[], Error>({
        queryKey: ['words'],
        queryFn: fetchWords,
        staleTime: Infinity,
    });
}

export async function validateWord(word:string): Promise<boolean> {
    const res = await fetch(`/api/words/validate?word=${word}`);
    if(!res.ok) return false;
    const { valid } = await res.json();
    return valid
}