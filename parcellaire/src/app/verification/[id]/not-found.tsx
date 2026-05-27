import { Card, CardContent } from "@/components/ui/card";
import { XCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="py-12">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Parcelle Non Trouvée
          </h1>
          <p className="text-gray-500 text-sm">
            Cette parcelle n&apos;est pas enregistrée ou n&apos;a pas encore été validée
            dans le système de cartographie parcellaire.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
