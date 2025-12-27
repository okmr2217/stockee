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
  const hashedPassword = await hashPassword("password123");

  // ユーザー1: テストユーザー（グループオーナー）
  const user1 = await prisma.user.upsert({
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

  // ユーザー2: 田中さん（グループメンバー）
  const user2 = await prisma.user.upsert({
    where: { email: "tanaka@example.com" },
    update: {},
    create: {
      name: "田中太郎",
      email: "tanaka@example.com",
      emailVerified: true,
      accounts: {
        create: {
          accountId: "tanaka@example.com",
          providerId: "credential",
          password: hashedPassword,
        },
      },
    },
  });

  // ユーザー3: 佐藤さん（グループメンバー）
  const user3 = await prisma.user.upsert({
    where: { email: "sato@example.com" },
    update: {},
    create: {
      name: "佐藤花子",
      email: "sato@example.com",
      emailVerified: true,
      accounts: {
        create: {
          accountId: "sato@example.com",
          providerId: "credential",
          password: hashedPassword,
        },
      },
    },
  });

  // グループ1: 家族グループ（user1がオーナー、user2がメンバー）
  const familyGroup = await prisma.group.upsert({
    where: { inviteCode: "family-invite-code" },
    update: {},
    create: {
      name: "田中家",
      inviteCode: "family-invite-code",
      ownerId: user1.id,
      members: {
        create: [{ userId: user1.id }, { userId: user2.id }],
      },
    },
  });

  // グループ2: シェアハウスグループ（user2がオーナー、user1とuser3がメンバー）
  const shareHouseGroup = await prisma.group.upsert({
    where: { inviteCode: "sharehouse-invite-code" },
    update: {},
    create: {
      name: "シェアハウス",
      inviteCode: "sharehouse-invite-code",
      ownerId: user2.id,
      members: {
        create: [{ userId: user2.id }, { userId: user1.id }, { userId: user3.id }],
      },
    },
  });

  // user1の個人アイテム（sortOrder付き）
  await prisma.item.deleteMany({ where: { userId: user1.id, groupId: null } });
  await prisma.item.createMany({
    data: [
      { name: "りんご", unit: "個", quantity: 10, sortOrder: 0, userId: user1.id },
      { name: "みかん", unit: "個", quantity: 5, sortOrder: 1, userId: user1.id },
      { name: "牛乳", unit: "本", quantity: 2, sortOrder: 2, userId: user1.id },
    ],
  });

  // user2の個人アイテム
  await prisma.item.deleteMany({ where: { userId: user2.id, groupId: null } });
  await prisma.item.createMany({
    data: [
      { name: "ビール", unit: "缶", quantity: 6, sortOrder: 0, userId: user2.id },
      { name: "チーズ", unit: "個", quantity: 3, sortOrder: 1, userId: user2.id },
    ],
  });

  // user3の個人アイテム
  await prisma.item.deleteMany({ where: { userId: user3.id, groupId: null } });
  await prisma.item.createMany({
    data: [
      { name: "ヨーグルト", unit: "個", quantity: 4, sortOrder: 0, userId: user3.id },
      { name: "パン", unit: "斤", quantity: 1, sortOrder: 1, userId: user3.id },
    ],
  });

  // 家族グループの共有アイテム
  await prisma.item.deleteMany({ where: { groupId: familyGroup.id } });
  await prisma.item.createMany({
    data: [
      { name: "お米", unit: "kg", quantity: 5, sortOrder: 0, groupId: familyGroup.id },
      { name: "醤油", unit: "本", quantity: 1, sortOrder: 1, groupId: familyGroup.id },
      { name: "味噌", unit: "パック", quantity: 2, sortOrder: 2, groupId: familyGroup.id },
      { name: "卵", unit: "パック", quantity: 1, sortOrder: 3, groupId: familyGroup.id },
    ],
  });

  // シェアハウスグループの共有アイテム
  await prisma.item.deleteMany({ where: { groupId: shareHouseGroup.id } });
  await prisma.item.createMany({
    data: [
      { name: "トイレットペーパー", unit: "ロール", quantity: 12, sortOrder: 0, groupId: shareHouseGroup.id },
      { name: "洗剤", unit: "本", quantity: 2, sortOrder: 1, groupId: shareHouseGroup.id },
      { name: "ゴミ袋", unit: "枚", quantity: 30, sortOrder: 2, groupId: shareHouseGroup.id },
      { name: "シャンプー", unit: "本", quantity: 1, sortOrder: 3, groupId: shareHouseGroup.id },
      { name: "ティッシュ", unit: "箱", quantity: 5, sortOrder: 4, groupId: shareHouseGroup.id },
    ],
  });

  console.log("Seed completed!");
  console.log("");
  console.log("テストアカウント（すべてパスワード: password123）:");
  console.log("  - test@example.com（テストユーザー）");
  console.log("  - tanaka@example.com（田中太郎）");
  console.log("  - sato@example.com（佐藤花子）");
  console.log("");
  console.log("グループ:");
  console.log(`  - 田中家（招待コード: family-invite-code）`);
  console.log(`  - シェアハウス（招待コード: sharehouse-invite-code）`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
