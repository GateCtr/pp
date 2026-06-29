import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion Agent Collecteur",
  description:
    "Connectez-vous avec votre code d'accès pour accéder à l'application de collecte terrain DIGIPARC.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
