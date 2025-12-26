import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemCard } from "@/components/item/item-card";
import { getItems } from "@/actions/item";

export default async function HomePage() {
  const items = await getItems();

  return (
    <div>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h1 className="text-lg font-semibold">日用品在庫管理</h1>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/items/new">
            <Plus className="h-5 w-5" />
            <span className="sr-only">品目を追加</span>
          </Link>
        </Button>
      </div>

      <div className="p-4">
        {items.length === 0 ? (
          <p className="text-muted-foreground">品目がありません</p>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
