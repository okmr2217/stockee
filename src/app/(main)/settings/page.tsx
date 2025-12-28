import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { AccountSettings } from "@/components/settings/account-settings";
import { PersonalCategories } from "./personal-categories";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <div>
      <div className="relative flex items-center border-b px-4 py-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-1 h-4 w-4" />
            戻る
          </Link>
        </Button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold">
          設定
        </h1>
      </div>

      <div className="space-y-6 p-4">
        <AccountSettings user={{ id: user.id, name: user.name, email: user.email }} />

        <PersonalCategories />

        <LogoutButton />
      </div>
    </div>
  );
}
