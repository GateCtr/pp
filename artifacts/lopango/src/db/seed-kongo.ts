/**
 * Seed script — Province du Kongo Central
 * Run: npx tsx src/db/seed-kongo.ts
 */
import { db } from "./index";
import { lieuxGeo, avenues } from "./schema";

async function seed() {
  console.log("🌱 Seeding Kongo Central geographic data…");

  // Province level is implicit — all records belong to Kongo Central

  // ─── Villes ──────────────────────────────────────────────────────────────
  const [matadi] = await db
    .insert(lieuxGeo)
    .values({ nom: "Matadi", type: "ville", code: "MAT" })
    .returning();

  const [boma] = await db
    .insert(lieuxGeo)
    .values({ nom: "Boma", type: "ville", code: "BOM" })
    .returning();

  // ─── Territoires ─────────────────────────────────────────────────────────
  const territoires = await db
    .insert(lieuxGeo)
    .values([
      { nom: "Kasangulu", type: "territoire", code: "KAS" },
      { nom: "Kimvula", type: "territoire", code: "KIM" },
      { nom: "Lukula", type: "territoire", code: "LUK" },
      { nom: "Luozi", type: "territoire", code: "LUO" },
      { nom: "Madimba", type: "territoire", code: "MAD" },
      { nom: "Mbanza-Ngungu", type: "territoire", code: "MBN" },
      { nom: "Moanda", type: "territoire", code: "MOA" },
      { nom: "Seke-Banza", type: "territoire", code: "SKB" },
      { nom: "Songololo", type: "territoire", code: "SON" },
      { nom: "Tshela", type: "territoire", code: "TSH" },
    ])
    .returning();

  const tKasangulu = territoires[0];
  const tKimvula = territoires[1];
  const tLukula = territoires[2];
  const tLuozi = territoires[3];
  const tMadimba = territoires[4];
  const tMbanzaNgungu = territoires[5];
  const tMoanda = territoires[6];
  const tSekeBanza = territoires[7];
  const tSongololo = territoires[8];
  const tTshela = territoires[9];

  // ─── Communes de Matadi ───────────────────────────────────────────────────
  const [cMatadi, cMvuzi, cNzanza] = await db
    .insert(lieuxGeo)
    .values([
      { nom: "Commune Matadi", type: "commune", parentId: matadi.id, code: "MAT-COM" },
      { nom: "Commune Mvuzi", type: "commune", parentId: matadi.id, code: "MVU" },
      { nom: "Commune Nzanza", type: "commune", parentId: matadi.id, code: "NZA" },
    ])
    .returning();

  // ─── Communes de Boma ─────────────────────────────────────────────────────
  const [cKalamu, cKabondo, cNzadi] = await db
    .insert(lieuxGeo)
    .values([
      { nom: "Commune Kalamu", type: "commune", parentId: boma.id, code: "KAL" },
      { nom: "Commune Kabondo", type: "commune", parentId: boma.id, code: "KAB" },
      { nom: "Commune Nzadi", type: "commune", parentId: boma.id, code: "NZD" },
    ])
    .returning();

  // ─── Secteurs des 10 territoires ─────────────────────────────────────────
  await db.insert(lieuxGeo).values([
    // Kasangulu
    { nom: "Secteur Kasangulu", type: "secteur", parentId: tKasangulu.id },
    { nom: "Secteur Luila", type: "secteur", parentId: tKasangulu.id },
    { nom: "Secteur Lukunga-Mputu", type: "secteur", parentId: tKasangulu.id },
    // Kimvula
    { nom: "Secteur Kimvula", type: "secteur", parentId: tKimvula.id },
    { nom: "Secteur Lula", type: "secteur", parentId: tKimvula.id },
    // Lukula
    { nom: "Secteur Lukula", type: "secteur", parentId: tLukula.id },
    { nom: "Secteur Tsundi", type: "secteur", parentId: tLukula.id },
    { nom: "Secteur Mayumbe", type: "secteur", parentId: tLukula.id },
    // Luozi
    { nom: "Secteur Boko-Songo", type: "secteur", parentId: tLuozi.id },
    { nom: "Secteur Kizu", type: "secteur", parentId: tLuozi.id },
    { nom: "Secteur Mfidi", type: "secteur", parentId: tLuozi.id },
    { nom: "Secteur Nsa", type: "secteur", parentId: tLuozi.id },
    // Madimba
    { nom: "Secteur Gombe-Matadi", type: "secteur", parentId: tMadimba.id },
    { nom: "Secteur Madimba", type: "secteur", parentId: tMadimba.id },
    { nom: "Secteur Mbanza-Mboma", type: "secteur", parentId: tMadimba.id },
    // Mbanza-Ngungu
    { nom: "Secteur Boko", type: "secteur", parentId: tMbanzaNgungu.id },
    { nom: "Secteur Palabala", type: "secteur", parentId: tMbanzaNgungu.id },
    { nom: "Secteur Lunzadi", type: "secteur", parentId: tMbanzaNgungu.id },
    { nom: "Secteur Gombe-Sud", type: "secteur", parentId: tMbanzaNgungu.id },
    // Moanda
    { nom: "Secteur Banana", type: "secteur", parentId: tMoanda.id },
    { nom: "Secteur Lubu", type: "secteur", parentId: tMoanda.id },
    // Seke-Banza
    { nom: "Secteur Seke-Banza", type: "secteur", parentId: tSekeBanza.id },
    { nom: "Secteur Nkandu", type: "secteur", parentId: tSekeBanza.id },
    // Songololo
    { nom: "Secteur Kwilu-Ngongo", type: "secteur", parentId: tSongololo.id },
    { nom: "Secteur Lubu (Songololo)", type: "secteur", parentId: tSongololo.id },
    { nom: "Secteur Lukunga", type: "secteur", parentId: tSongololo.id },
    // Tshela
    { nom: "Secteur Tshela", type: "secteur", parentId: tTshela.id },
    { nom: "Secteur Kongo", type: "secteur", parentId: tTshela.id },
    { nom: "Secteur Sanda", type: "secteur", parentId: tTshela.id },
  ]);

  // ─── Quartiers de Matadi (Commune Matadi) ────────────────────────────────
  const [qSoyo, qFischier, qKibala, qTshimpi, qKinkonzi, qMatadi, qBulu, qMabilu, qMfita] =
    await db
      .insert(lieuxGeo)
      .values([
        { nom: "Soyo", type: "quartier", parentId: cMatadi.id },
        { nom: "Fischier", type: "quartier", parentId: cMatadi.id },
        { nom: "Kibala", type: "quartier", parentId: cMatadi.id },
        { nom: "Tshimpi", type: "quartier", parentId: cMatadi.id },
        { nom: "Kinkonzi", type: "quartier", parentId: cMatadi.id },
        { nom: "Matadi-Ancien", type: "quartier", parentId: cMatadi.id },
        { nom: "Bulu", type: "quartier", parentId: cMatadi.id },
        { nom: "Mabilu", type: "quartier", parentId: cMatadi.id },
        { nom: "Mfita", type: "quartier", parentId: cMatadi.id },
      ])
      .returning();

  // ─── Quartiers Mvuzi ─────────────────────────────────────────────────────
  const [qMvuzi, qNgedi, qCampMil] = await db
    .insert(lieuxGeo)
    .values([
      { nom: "Mvuzi", type: "quartier", parentId: cMvuzi.id },
      { nom: "Ngedi", type: "quartier", parentId: cMvuzi.id },
      { nom: "Camp Militaire", type: "quartier", parentId: cMvuzi.id },
    ])
    .returning();

  // ─── Quartiers Nzanza ────────────────────────────────────────────────────
  const [qNzanza, qGare, qKinkanda] = await db
    .insert(lieuxGeo)
    .values([
      { nom: "Nzanza", type: "quartier", parentId: cNzanza.id },
      { nom: "Gare", type: "quartier", parentId: cNzanza.id },
      { nom: "Kinkanda", type: "quartier", parentId: cNzanza.id },
    ])
    .returning();

  // ─── Quartiers Boma ───────────────────────────────────────────────────────
  await db.insert(lieuxGeo).values([
    { nom: "Kalamu I", type: "quartier", parentId: cKalamu.id },
    { nom: "Kalamu II", type: "quartier", parentId: cKalamu.id },
    { nom: "Kabondo I", type: "quartier", parentId: cKabondo.id },
    { nom: "Kabondo II", type: "quartier", parentId: cKabondo.id },
    { nom: "Bois-du-Roi", type: "quartier", parentId: cKabondo.id },
    { nom: "Nzadi I", type: "quartier", parentId: cNzadi.id },
    { nom: "Nzadi II", type: "quartier", parentId: cNzadi.id },
  ]);

  // ─── Avenues de démonstration (Matadi — Commune Matadi) ──────────────────
  await db.insert(avenues).values([
    { nom: "Avenue de l'Indépendance", quartierId: qSoyo.id },
    { nom: "Avenue Kibangu", quartierId: qSoyo.id },
    { nom: "Avenue du Congo", quartierId: qSoyo.id },
    { nom: "Avenue Lumumba", quartierId: qFischier.id },
    { nom: "Avenue Mobutu", quartierId: qFischier.id },
    { nom: "Avenue Kasa-Vubu", quartierId: qKibala.id },
    { nom: "Avenue de la Paix", quartierId: qKibala.id },
    { nom: "Avenue Tshimpi", quartierId: qTshimpi.id },
    { nom: "Avenue Centrale", quartierId: qTshimpi.id },
    { nom: "Avenue Kinkonzi", quartierId: qKinkonzi.id },
    { nom: "Avenue des Palmiers", quartierId: qMatadi.id },
    { nom: "Avenue Bulu", quartierId: qBulu.id },
    { nom: "Avenue Mabilu", quartierId: qMabilu.id },
    { nom: "Avenue Mfita", quartierId: qMfita.id },
    // Mvuzi
    { nom: "Avenue Mvuzi", quartierId: qMvuzi.id },
    { nom: "Avenue Ngedi", quartierId: qNgedi.id },
    { nom: "Avenue du Camp", quartierId: qCampMil.id },
    // Nzanza
    { nom: "Avenue Nzanza", quartierId: qNzanza.id },
    { nom: "Avenue de la Gare", quartierId: qGare.id },
    { nom: "Avenue Kinkanda", quartierId: qKinkanda.id },
  ]);

  console.log("✅ Kongo Central seed complete.");
  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ Seed error:", e);
  process.exit(1);
});
