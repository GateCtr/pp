"use client";

import { UserButton } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Menu,
  X,
  ChevronRight,
  Palette,
  Map,
  Loader2,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

const navItems = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/parcelles", label: "Parcelles", icon: FileText },
  { href: "/admin/collecteurs", label: "Collecteurs", icon: Users },
  { href: "/admin/geo", label: "Géographie", icon: Map },
  { href: "/admin/plaques-templates", label: "Plaques Templates", icon: Palette },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Clear pending when navigation settles
  useEffect(() => {
    if (!isPending) setPendingHref(null);
  }, [isPending]);

  if (pathname?.includes("/sign-in")) {
    return <>{children}</>;
  }

  function navigate(href: string) {
    if (href === pathname) return;
    setPendingHref(href);
    setSidebarOpen(false);
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top progress bar */}
      {isPending && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-blue-100 overflow-hidden">
          <div className="h-full bg-blue-500 animate-[progress_1.2s_ease-in-out_infinite]" />
        </div>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 z-50 transform transition-transform duration-300 ease-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100">
          <button onClick={() => navigate("/admin")} className="flex items-center gap-2.5">
            <Logo size="sm" />
            <div>
              <span className="font-bold text-gray-900 text-sm">Lopango</span>
              <span className="text-gray-400 text-[10px] block -mt-0.5">Administration</span>
            </div>
          </button>
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const isActive = (pendingHref ?? pathname) === item.href;
            const isLoading = isPending && pendingHref === item.href;
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-[18px] h-[18px] text-blue-500 animate-spin" />
                ) : (
                  <item.icon
                    className={`w-[18px] h-[18px] ${
                      isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                )}
                {item.label}
                {isActive && !isLoading && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-blue-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2">
            <UserButton />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">Administrateur</p>
              <p className="text-[10px] text-gray-400">Compte Clerk</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="md:ml-64 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-semibold text-gray-900 text-sm sm:text-base">
                {navItems.find((n) => n.href === (pendingHref ?? pathname))?.label || "Administration"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
              <div className={`w-1.5 h-1.5 rounded-full ${isPending ? "bg-blue-400 animate-pulse" : "bg-emerald-400"}`} />
              <span className={`text-xs font-medium ${isPending ? "text-blue-700" : "text-emerald-700"}`}>
                {isPending ? "Chargement…" : "En ligne"}
              </span>
            </div>
            <div className="md:hidden">
              <UserButton />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
