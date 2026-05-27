import { getCollectorSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MapPin, LogOut } from "lucide-react";
import Link from "next/link";

export default async function CollecteurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCollectorSession();

  if (!session) {
    redirect("/collecteur/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <span className="font-semibold text-sm">Parcellaire RDC</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-blue-200 text-sm">{session.nom}</span>
            <Link
              href="/api/auth/collector/logout"
              className="text-blue-200 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 max-w-2xl">{children}</main>
    </div>
  );
}
