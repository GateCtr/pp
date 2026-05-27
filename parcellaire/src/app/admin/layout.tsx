import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { MapPin, LayoutDashboard, Users, FileText } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r shadow-sm z-30 hidden md:block">
        <div className="p-4 border-b">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-800">Parcellaire Admin</span>
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 text-gray-700"
          >
            <LayoutDashboard className="w-4 h-4" />
            Tableau de bord
          </Link>
          <Link
            href="/admin/parcelles"
            className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 text-gray-700"
          >
            <FileText className="w-4 h-4" />
            Parcelles
          </Link>
          <Link
            href="/admin/collecteurs"
            className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 text-gray-700"
          >
            <Users className="w-4 h-4" />
            Collecteurs
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <div className="md:ml-64">
        {/* Top bar */}
        <header className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <h2 className="font-semibold text-gray-800">Administration</h2>
          <UserButton />
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
