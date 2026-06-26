import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { parcelles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [parcelle] = await db
      .select()
      .from(parcelles)
      .where(eq(parcelles.id, id))
      .limit(1);

    if (!parcelle || parcelle.statutValidation !== "valide") {
      return NextResponse.json(
        { error: "Plaque non disponible" },
        { status: 404 }
      );
    }

    if (!parcelle.plaqueImageUrl) {
      return NextResponse.json(
        { error: "Plaque non encore générée" },
        { status: 404 }
      );
    }

    // If it's a data URL, decode and serve the SVG
    if (parcelle.plaqueImageUrl.startsWith("data:image/svg+xml;base64,")) {
      const base64 = parcelle.plaqueImageUrl.replace(
        "data:image/svg+xml;base64,",
        ""
      );
      const svg = Buffer.from(base64, "base64");
      return new NextResponse(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // If it's an external URL (R2), redirect
    return NextResponse.redirect(parcelle.plaqueImageUrl);
  } catch (error) {
    console.error("Plate image error:", error);
    return NextResponse.json(
      { error: "Erreur interne" },
      { status: 500 }
    );
  }
}
