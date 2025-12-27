import { prisma } from "../src/lib/prisma";
import { scryptAsync } from "@noble/hashes/scrypt.js";
import { bytesToHex, randomBytes } from "@noble/hashes/utils.js";

// better-authと完全に同じ形式でパスワードをハッシュ化
async function hashPassword(password: string): Promise<string> {
  const salt = bytesToHex(randomBytes(16));
  const key = await scryptAsync(password.normalize("NFKC"), salt, {
    N: 16384,
    r: 16,
    p: 1,
    dkLen: 64,
  });
  return `${salt}:${bytesToHex(key)}`;
}

async function main() {
  // テストユーザー作成
  const hashedPassword = await hashPassword("password123");

  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      name: "テストユーザー",
      email: "test@example.com",
      emailVerified: true,
      accounts: {
        create: {
          accountId: "test@example.com",
          providerId: "credential",
          password: hashedPassword,
        },
      },
    },
  });

  // テスト品目作成
  await prisma.item.createMany({
    data: [
      { name: "りんご", unit: "個", quantity: 10, userId: user.id },
      { name: "みかん", unit: "個", quantity: 5, userId: user.id },
      { name: "牛乳", unit: "本", quantity: 2, userId: user.id },
    ],
    skipDuplicates: true,
  });

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
