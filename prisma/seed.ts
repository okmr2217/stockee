import { prisma } from "../src/lib/prisma";
import { scryptAsync } from "@noble/hashes/scrypt.js";
import { bytesToHex, randomBytes } from "@noble/hashes/utils.js";

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

  // 既存データを削除
  await prisma.item.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.groupMember.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  // ユーザー作成
  const user1 = await prisma.user.create({
    data: {
      name: "山田 一郎",
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

  const user2 = await prisma.user.create({
    data: {
      name: "山田 直子",
      email: "naoko@example.com",
      emailVerified: true,
      accounts: {
        create: {
          accountId: "naoko@example.com",
          providerId: "credential",
          password: hashedPassword,
        },
      },
    },
  });

  // 個人カテゴリ
  const catFood = await prisma.category.create({
    data: { name: "食材", color: "#10b981", sortOrder: 0, userId: user1.id },
  });
  const catDaily = await prisma.category.create({
    data: { name: "日用品", color: "#3b82f6", sortOrder: 1, userId: user1.id },
  });
  const catDrink = await prisma.category.create({
    data: { name: "飲み物", color: "#f59e0b", sortOrder: 2, userId: user1.id },
  });

  // 個人アイテム（threshold 未満は amber 警告表示）
  await prisma.item.createMany({
    data: [
      { name: "お米",               unit: "kg",     quantity: 3,  threshold: 2,    price: 500,  productName: "あきたこまち 5kg",      sortOrder: 0,  userId: user1.id, categoryId: catFood.id  },
      { name: "食パン",             unit: "斤",     quantity: 1,  threshold: 2,    price: 250,  sortOrder: 1,  userId: user1.id, categoryId: catFood.id  },
      { name: "卵",                 unit: "パック", quantity: 0,  threshold: 1,    price: 228,  productName: "Mサイズ 10個入り",      sortOrder: 2,  userId: user1.id, categoryId: catFood.id  },
      { name: "牛乳",               unit: "本",     quantity: 2,  threshold: 1,    price: 198,  sortOrder: 3,  userId: user1.id, categoryId: catFood.id  },
      { name: "バナナ",             unit: "房",     quantity: 1,  threshold: null, price: 198,  sortOrder: 4,  userId: user1.id, categoryId: catFood.id  },
      { name: "ヨーグルト",         unit: "個",     quantity: 4,  threshold: 2,    price: 148,  sortOrder: 5,  userId: user1.id, categoryId: catFood.id  },
      { name: "トイレットペーパー", unit: "ロール", quantity: 6,  threshold: 4,    price: 150,  productName: "ダブル 12ロール",       sortOrder: 6,  userId: user1.id, categoryId: catDaily.id },
      { name: "シャンプー",         unit: "本",     quantity: 1,  threshold: 1,    price: 980,  sortOrder: 7,  userId: user1.id, categoryId: catDaily.id },
      { name: "洗濯洗剤",           unit: "本",     quantity: 0,  threshold: 1,    price: 498,  productName: "アリエール 4.5kg",      sortOrder: 8,  userId: user1.id, categoryId: catDaily.id },
      { name: "食器用洗剤",         unit: "本",     quantity: 2,  threshold: 1,    price: 218,  sortOrder: 9,  userId: user1.id, categoryId: catDaily.id },
      { name: "コーヒー",           unit: "袋",     quantity: 2,  threshold: 1,    price: 698,  productName: "ドリップコーヒー 50杯分", sortOrder: 10, userId: user1.id, categoryId: catDrink.id },
      { name: "お茶",               unit: "本",     quantity: 6,  threshold: 3,    price: 98,   productName: "2L ペットボトル",        sortOrder: 11, userId: user1.id, categoryId: catDrink.id },
      { name: "炭酸水",             unit: "本",     quantity: 12, threshold: 6,    price: 88,   sortOrder: 12, userId: user1.id, categoryId: catDrink.id },
    ],
  });

  // グループ（家族共有）
  const familyGroup = await prisma.group.create({
    data: {
      name: "山田家",
      inviteCode: "yamada-family-2026",
      ownerId: user1.id,
      members: {
        create: [{ userId: user1.id }, { userId: user2.id }],
      },
    },
  });

  // グループカテゴリ
  const groupCatFood = await prisma.category.create({
    data: { name: "食材", color: "#10b981", sortOrder: 0, groupId: familyGroup.id },
  });
  const groupCatConsumable = await prisma.category.create({
    data: { name: "消耗品", color: "#8b5cf6", sortOrder: 1, groupId: familyGroup.id },
  });

  // グループアイテム
  await prisma.item.createMany({
    data: [
      { name: "醤油",     unit: "本",     quantity: 1,  threshold: 1,  price: 298,  sortOrder: 0, groupId: familyGroup.id, categoryId: groupCatFood.id },
      { name: "味噌",     unit: "パック", quantity: 0,  threshold: 1,  price: 248,  sortOrder: 1, groupId: familyGroup.id, categoryId: groupCatFood.id },
      { name: "砂糖",     unit: "kg",     quantity: 2,  threshold: 1,  price: 198,  sortOrder: 2, groupId: familyGroup.id, categoryId: groupCatFood.id },
      { name: "サラダ油", unit: "本",     quantity: 1,  threshold: 1,  price: 348,  sortOrder: 3, groupId: familyGroup.id, categoryId: groupCatFood.id },
      { name: "ゴミ袋",   unit: "枚",     quantity: 40, threshold: 10, price: null, productName: "45L 半透明",        sortOrder: 4, groupId: familyGroup.id, categoryId: groupCatConsumable.id },
      { name: "ティッシュ", unit: "箱",   quantity: 5,  threshold: 2,  price: 148,  productName: "5箱パック×2セット", sortOrder: 5, groupId: familyGroup.id, categoryId: groupCatConsumable.id },
      { name: "ラップ",   unit: "本",     quantity: 1,  threshold: 1,  price: 198,  sortOrder: 6, groupId: familyGroup.id, categoryId: groupCatConsumable.id },
    ],
  });

  console.log("Seed completed!");
  console.log("");
  console.log("テストアカウント（パスワード: password123）:");
  console.log("  - test@example.com（山田 一郎）");
  console.log("  - naoko@example.com（山田 直子）");
  console.log("");
  console.log("グループ: 山田家（招待コード: yamada-family-2026）");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
