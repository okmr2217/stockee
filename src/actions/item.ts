"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import {
  createItemSchema,
  updateItemSchema,
  reorderItemsSchema,
  type CreateItemInput,
  type UpdateItemInput,
  type ReorderItemsInput,
} from "@/lib/validations/item";

export async function getItems() {
  const user = await getCurrentUser();

  return prisma.item.findMany({
    where: { userId: user.id },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getItem(id: string) {
  const user = await getCurrentUser();

  return prisma.item.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });
}

export async function createItem(input: CreateItemInput) {
  const user = await getCurrentUser();
  const validated = createItemSchema.parse(input);

  const maxSortOrder = await prisma.item.aggregate({
    where: { userId: user.id },
    _max: { sortOrder: true },
  });

  const item = await prisma.item.create({
    data: {
      ...validated,
      sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
      userId: user.id,
    },
  });

  revalidatePath("/");
  return item;
}

export async function updateItem(id: string, input: UpdateItemInput) {
  const user = await getCurrentUser();
  const validated = updateItemSchema.parse(input);

  const existing = await prisma.item.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    throw new Error("Item not found");
  }

  const item = await prisma.item.update({
    where: { id },
    data: validated,
  });

  revalidatePath("/");
  return item;
}

export async function deleteItem(id: string) {
  const user = await getCurrentUser();

  const existing = await prisma.item.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    throw new Error("Item not found");
  }

  await prisma.item.delete({
    where: { id },
  });

  revalidatePath("/");
}

export async function incrementStock(id: string) {
  const user = await getCurrentUser();

  const existing = await prisma.item.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    throw new Error("Item not found");
  }

  const item = await prisma.item.update({
    where: { id },
    data: {
      quantity: { increment: 1 },
    },
  });

  revalidatePath("/");
  return item;
}

export async function decrementStock(id: string) {
  const user = await getCurrentUser();

  const existing = await prisma.item.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    throw new Error("Item not found");
  }

  if (existing.quantity <= 0) {
    throw new Error("Stock cannot be negative");
  }

  const item = await prisma.item.update({
    where: { id },
    data: {
      quantity: { decrement: 1 },
    },
  });

  revalidatePath("/");
  return item;
}

export async function reorderItems(input: ReorderItemsInput) {
  const user = await getCurrentUser();
  const validated = reorderItemsSchema.parse(input);

  const itemIds = validated.map((item) => item.id);
  const existingItems = await prisma.item.findMany({
    where: {
      id: { in: itemIds },
      userId: user.id,
    },
    select: { id: true },
  });

  const existingIds = new Set(existingItems.map((item) => item.id));
  const allBelongToUser = itemIds.every((id) => existingIds.has(id));

  if (!allBelongToUser) {
    throw new Error("Some items not found or do not belong to user");
  }

  await prisma.$transaction(
    validated.map((item) =>
      prisma.item.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      })
    )
  );

  revalidatePath("/");
}
