import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Sounds Fishy questions...');

  const seedFilePath = path.join(__dirname, 'sounds-fishy-seed.json');
  const fileContent = fs.readFileSync(seedFilePath, 'utf-8');
  const questions = JSON.parse(fileContent);

  for (const q of questions) {
    await prisma.soundsFishyQuestion.create({
      data: {
        question: q.question,
        answer: q.answer,
        lang: q.lang,
      },
    });
  }

  console.log(`Successfully seeded ${questions.length} Sounds Fishy questions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
