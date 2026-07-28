import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const usersWithPlainTokens = await prisma.user.findMany({
    where: {
      emailToken: { not: null },
      isEmailVerified: false,
    },
    select: { id: true, emailToken: true },
  });

  if (usersWithPlainTokens.length === 0) {
    console.log('No unverified users with email tokens found.');
    return;
  }

  let updated = 0;

  for (const user of usersWithPlainTokens) {
    const token = user.emailToken!;
    // Check if token is already a SHA256 hash (64 hex chars)
    if (/^[a-f0-9]{64}$/.test(token)) {
      continue;
    }
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: { emailToken: hashed },
    });
    updated++;
  }

  console.log(`Hashed ${updated} existing plaintext email tokens.`);
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
