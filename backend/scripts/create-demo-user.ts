/**
 * One-off script: create a demo user (email/password) so you can log in.
 * Run from backend: npx tsx scripts/create-demo-user.ts
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import prisma from '../src/database/client';

const DEMO_EMAIL = 'user@local';
const DEMO_PASSWORD = 'demo123';
const SALT_ROUNDS = 10;

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) {
    console.log(`User ${DEMO_EMAIL} already exists. You can log in with:`);
    console.log(`  Email: ${DEMO_EMAIL}`);
    console.log(`  Password: (the one you set when it was created, or run this script after deleting the user to reset)`);
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);
  await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      name: 'Demo User',
      passwordHash,
      isAdmin: false,
    },
  });

  console.log('Demo user created. Log in with:');
  console.log(`  Email: ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
