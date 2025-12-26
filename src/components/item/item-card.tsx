"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Minus, Plus, MoreVertical, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { incrementStock, decrementStock, deleteItem } from "@/actions/item";
import type { ItemModel } from "@/generated/prisma/models/Item";

type ItemCardProps = {
  item: ItemModel;
};

export function ItemCard({ item }: ItemCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleIncrement = () => {
    startTransition(async () => {
      await incrementStock(item.id);
    });
  };

  const handleDecrement = () => {
    if (item.quantity <= 0) return;
    startTransition(async () => {
      await decrementStock(item.id);
    });
  };

  const handleDelete = () => {
    if (!confirm("この品目を削除しますか？")) return;
    setIsDeleting(true);
    startTransition(async () => {
      await deleteItem(item.id);
    });
  };

  return (
    <div
      className={`rounded-lg border bg-card p-3 shadow-sm ${
        isDeleting ? "opacity-50" : ""
      }`}
    >
      <div className="font-medium">{item.name}</div>
      <div className="mt-1 flex items-center justify-between">
        <div className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          {item.productName || "\u00A0"}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleDecrement}
            disabled={isPending || item.quantity <= 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex min-w-[60px] items-center justify-center gap-1 text-sm">
            {item.quantity === 0 && (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            )}
            <span className={item.quantity === 0 ? "text-amber-500" : ""}>
              {item.quantity}
              {item.unit}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleIncrement}
            disabled={isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/items/${item.id}/edit`}>編集</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
              >
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
