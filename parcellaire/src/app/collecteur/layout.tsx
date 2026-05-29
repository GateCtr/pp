import { CollectorSessionProvider } from "@/components/collecteur/session-provider";
import { CollectorHeader } from "@/components/collecteur/collector-header";

export default function CollecteurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CollectorSessionProvider>
      <div className="min-h-screen bg-gray-50">
        <CollectorHeader />
        <main className="container mx-auto px-4 py-6 max-w-2xl animate-fade-in">
          {children}
        </main>
      </div>
    </CollectorSessionProvider>
  );
}
