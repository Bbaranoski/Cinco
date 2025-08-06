const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {

  const filePath = path.join(__dirname, '../data/palavras.txt');
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  const words = fileContent
    .split('\n')
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length === 5);

  for (const text of words) {
    await prisma.word.upsert({
      where: { text },
      update: {},
      create: { text },
    });
  }

  console.log(`Seeded ${words.length} words.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
