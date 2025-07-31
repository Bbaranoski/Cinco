import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {

    const words = [
    'amigo', 'carro', 'feliz', 'jogar', 'mundo',
    'prisma','node','react','tailw','express'
    ];

    for (const w of words) {
        await prisma.word.upsert({
            where: { text: w},
            update: {},
            create: { text: w},
        });
    }

    console.log(`Seeded ${words.length} words.`)
}

main().catch(e => console.log(e)).finally( async () => await prisma.$disconnect());