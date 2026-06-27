import { db } from "@/db";
import { plateTemplates } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PlaquesTemplatesClient } from "./plaques-templates-client";

export const dynamic = "force-dynamic";

export default async function PlaquesTemplatesPage() {
  const templates = await db
    .select()
    .from(plateTemplates)
    .orderBy(desc(plateTemplates.creeLe));

  return <PlaquesTemplatesClient templates={templates} />;
}
