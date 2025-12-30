import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemList } from "@/components/item/item-list";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <ItemList />
      <Button
        size="icon"
        className="fixed bottom-8 right-4 z-50 h-14 w-14 rounded-full shadow-lg"
        asChild
      >
        <Link href="/items/new">
          <Plus className="h-6 w-6" />
          <span className="sr-only">新しい取引を追加</span>
        </Link>
      </Button>
    </>
  );
}
