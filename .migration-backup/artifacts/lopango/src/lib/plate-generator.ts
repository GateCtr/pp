import QRCode from "qrcode";
import type { VariantDesign } from "@/db/schema";

// Output: 2400×1100px SVG (print quality @ 300 DPI for ~20×9cm plate)
const PLATE_WIDTH = 2400;
const PLATE_HEIGHT = 1100;

export interface PlateData {
  id: string;
  commune: string;
  quartier: string;
  avenue: string;
  numero: string;
  district?: string | null;
  districtLabel?: string | null;
  secteur?: string | null;
}

interface TemplateConfig {
  variant: VariantDesign;
  flagUrl?: string | null;
  sealUrl?: string | null;
}

// Legacy function (backward compatible)
export async function generatePlate(data: PlateData): Promise<{
  plaqueUrl: string;
  qrCodeUrl: string;
}> {
  return generatePlateWithTemplate(data);
}

// Main function with template support — outputs SVG (vectoriel)
export async function generatePlateWithTemplate(
  data: PlateData,
  templateConfig?: TemplateConfig
): Promise<{
  plaqueUrl: string;
  qrCodeUrl: string;
}> {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null) ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const verificationUrl = `${appUrl}/verification/${data.id}`;

  const qrBuffer = await QRCode.toBuffer(verificationUrl, {
    width: 400,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
    errorCorrectionLevel: templateConfig?.sealUrl ? "H" : "M",
    type: "png",
  });

  const qrDataUrl = `data:image/png;base64,${qrBuffer.toString("base64")}`;

  const plateSvg = templateConfig
    ? generateTemplatePlateSVG(data, qrDataUrl, templateConfig)
    : generateDefaultPlateSVG(data, qrDataUrl);

  const plateDataUrl = `data:image/svg+xml;base64,${Buffer.from(plateSvg).toString("base64")}`;

  let qrFinalUrl = `data:image/png;base64,${qrBuffer.toString("base64")}`;

  if (templateConfig?.sealUrl) {
    const qrWithSealSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 400 400" width="400" height="400">
      <image x="0" y="0" width="400" height="400" href="${qrDataUrl}"/>
      <circle cx="200" cy="200" r="56" fill="white"/>
      <clipPath id="qrSealClipStandalone"><circle cx="200" cy="200" r="48"/></clipPath>
      <image x="152" y="152" width="96" height="96" href="${escapeXml(templateConfig.sealUrl)}" clip-path="url(#qrSealClipStandalone)" preserveAspectRatio="xMidYMid slice"/>
    </svg>`;
    qrFinalUrl = `data:image/svg+xml;base64,${Buffer.from(qrWithSealSvg).toString("base64")}`;
  }

  return {
    plaqueUrl: plateDataUrl,
    qrCodeUrl: qrFinalUrl,
  };
}

// Prefix avenue name with "AVENUE" if not already prefixed
function prefixAvenue(name: string): string {
  const upper = name.toUpperCase().trim();
  if (
    upper.startsWith("AVENUE ") ||
    upper.startsWith("AV. ") ||
    upper.startsWith("AV ") ||
    upper.startsWith("AVE ") ||
    upper.startsWith("AVENUE.")
  ) {
    return upper;
  }
  return `AVENUE ${upper}`;
}

// Extract Google Font name from font-family string for SVG @import
function extractGoogleFontName(fontFamily: string): string | null {
  const systemFonts = ["Arial", "Verdana", "Trebuchet MS", "Impact", "Georgia", "Times New Roman", "Courier New"];
  const first = fontFamily.split(",")[0].replace(/['"]/g, "").trim();
  if (systemFonts.some((f) => f.toLowerCase() === first.toLowerCase())) return null;
  return first;
}

// Build a <style> block to import Google Fonts inside the SVG
function buildFontStyle(fontFamily: string): string {
  const name = extractGoogleFontName(fontFamily);
  if (!name) return "";
  const encoded = encodeURIComponent(name);
  return `<style>@import url('https://fonts.googleapis.com/css2?family=${encoded}:wght@400;600;700;900&amp;display=swap');</style>`;
}

// ============================================================
// TEMPLATE-BASED PLATE — elegant professional layout 2400×1100
// Layout:
//   Top    : flag (left) | COMMUNE DE / [commune] / QUARTIER [xxx] (center) | seal (right)
//   Separator: thin horizontal line BELOW quartier
//   Middle : full-width avenue band with AVENUE [xxx]
//   Bottom : large N° (left) | QR code (right)
// ============================================================
function generateTemplatePlateSVG(
  data: PlateData,
  qrDataUrl: string,
  config: TemplateConfig
): string {
  const { variant, flagUrl, sealUrl } = config;
  const commune = data.commune.toUpperCase();
  const quartier = data.quartier.toUpperCase();
  const avenue = prefixAvenue(data.avenue);
  const numero = data.numero;

  const rx = variant.shape === "rectangle" ? "8" : variant.shape === "rounded" ? "24" : "40";
  const innerRx = String(Math.max(0, Number(rx) - 4));

  // Resolve colors with fallbacks for backward compatibility
  const aColor       = escapeXml(variant.avenueColor   || variant.borderColor);
  const aTextColor   = escapeXml(variant.avenueTextColor  || variant.textColor);
  const cNameColor   = escapeXml(variant.communeNameColor  || variant.textColor);
  const nLabelColor  = escapeXml(variant.numeroLabelColor  || variant.accentColor);
  const nColor       = escapeXml(variant.numeroColor       || variant.textColor);
  const hLineColor   = escapeXml(variant.hLineColor        || variant.borderColor);
  const vLineColor   = escapeXml(variant.vLineColor        || variant.borderColor);
  const accentColor  = escapeXml(variant.accentColor);
  const fontFamily   = escapeXml(variant.fontFamily);

  // ── Layout measurements ──────────────────────────────────────
  // Header zone: y=16..290
  //   "COMMUNE DE"   baseline y=82  (font 50)
  //   Commune name   baseline y=172 (font 90)
  //   QUARTIER       baseline y=248 (font 56) ← above separator
  //   H-separator    y=278
  // Avenue band: y=294..528 (h=234)
  //   Avenue text    baseline y=452
  // Bottom zone: y=534..1084
  //   V-separator    x=1700
  //   Left center    x=858
  //   N°             x=840 textAnchor=end   y=825
  //   Numero         x=880 textAnchor=start y=825
  //   QR (360×360)   x=1930 y=618 → right=2290, bottom=978
  //   QR seal center cx=2110 cy=798

  const QR_X = 1930;
  const QR_Y = 618;
  const QR_SIZE = 360;
  const QR_CX = QR_X + QR_SIZE / 2;
  const QR_CY = QR_Y + QR_SIZE / 2;

  const qrSvgContent = sealUrl
    ? `<image x="${QR_X}" y="${QR_Y}" width="${QR_SIZE}" height="${QR_SIZE}" href="${qrDataUrl}"/>
       <circle cx="${QR_CX}" cy="${QR_CY}" r="46" fill="white"/>
       <clipPath id="qrSeal"><circle cx="${QR_CX}" cy="${QR_CY}" r="39"/></clipPath>
       <image x="${QR_CX - 39}" y="${QR_CY - 39}" width="78" height="78" href="${escapeXml(sealUrl)}" clip-path="url(#qrSeal)" preserveAspectRatio="xMidYMid slice"/>`
    : `<image x="${QR_X}" y="${QR_Y}" width="${QR_SIZE}" height="${QR_SIZE}" href="${qrDataUrl}"/>`;

  // Flag: margin from left (x=120) and top (y=40)
  const flagContent = flagUrl
    ? `<image x="120" y="40" width="190" height="130" href="${escapeXml(flagUrl)}" preserveAspectRatio="xMidYMid meet"/>`
    : `<g transform="translate(120, 40)">
        <rect width="190" height="130" fill="#007FFF" rx="6"/>
        <polygon points="0,92 0,130 149,39 149,0 190,0 190,39 41,130 0,130" fill="#CE1021"/>
        <line x1="0" y1="86" x2="153" y2="0" stroke="#F7D618" stroke-width="5"/>
        <line x1="35" y1="130" x2="190" y2="44" stroke="#F7D618" stroke-width="5"/>
        <polygon points="41,30 46,47 62,47 49,57 54,74 41,64 27,74 32,57 19,47 35,47" fill="#F7D618"/>
      </g>`;

  // Seal: top-right (cx=2240, cy=100, r=70)
  const sealContent = sealUrl
    ? `<clipPath id="plateSeal"><circle cx="2240" cy="100" r="70"/></clipPath>
       <image x="2170" y="30" width="140" height="140" href="${escapeXml(sealUrl)}" clip-path="url(#plateSeal)" preserveAspectRatio="xMidYMid slice"/>`
    : `<circle cx="2240" cy="100" r="70" fill="none" stroke="${escapeXml(variant.borderColor)}" stroke-width="4" opacity="0.5"/>
       <circle cx="2240" cy="100" r="52" fill="none" stroke="${escapeXml(variant.borderColor)}" stroke-width="2" opacity="0.3"/>`;

  const fontStyle = buildFontStyle(variant.fontFamily);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 ${PLATE_WIDTH} ${PLATE_HEIGHT}" width="${PLATE_WIDTH}" height="${PLATE_HEIGHT}">
  ${fontStyle}

  <!-- Outer frame -->
  <rect x="0" y="0" width="${PLATE_WIDTH}" height="${PLATE_HEIGHT}" rx="${rx}" ry="${rx}" fill="${escapeXml(variant.borderColor)}"/>
  <!-- Inner background -->
  <rect x="16" y="16" width="${PLATE_WIDTH - 32}" height="${PLATE_HEIGHT - 32}" rx="${innerRx}" ry="${innerRx}" fill="${escapeXml(variant.bgColor)}"/>

  <!-- Flag (top left) -->
  ${flagContent}

  <!-- Seal (top right) -->
  ${sealContent}

  <!-- "COMMUNE DE" label — accent color (variante) -->
  <text x="1200" y="82" text-anchor="middle" fill="${accentColor}" font-size="50" font-family="${fontFamily}" font-weight="600" letter-spacing="3">COMMUNE DE</text>

  <!-- Commune name — couleur propre -->
  <text x="1200" y="172" text-anchor="middle" fill="${cNameColor}" font-size="90" font-family="${fontFamily}" font-weight="bold">${escapeXml(commune)}</text>

  <!-- QUARTIER — accent color (variante) — AU-DESSUS de la ligne -->
  <text x="1200" y="248" text-anchor="middle" fill="${accentColor}" font-size="56" font-family="${fontFamily}" font-weight="600" letter-spacing="2">QUARTIER ${escapeXml(quartier)}</text>

  <!-- Horizontal separator — couleur propre — SOUS le quartier -->
  <line x1="65" y1="278" x2="2335" y2="278" stroke="${hLineColor}" stroke-width="2" opacity="0.5"/>

  <!-- Avenue band (full inner width) -->
  <rect x="16" y="294" width="${PLATE_WIDTH - 32}" height="234" rx="0" fill="${aColor}"/>

  <!-- Avenue name — couleur propre (centered on band, baseline ≈ 452) -->
  <text x="1200" y="452" text-anchor="middle" fill="${aTextColor}" font-size="118" font-family="${fontFamily}" font-weight="bold">${escapeXml(avenue)}</text>

  <!-- Vertical separator — couleur propre -->
  <line x1="1700" y1="534" x2="1700" y2="1084" stroke="${vLineColor}" stroke-width="2" opacity="0.3"/>

  <!-- N° — couleur propre, centré dans la zone gauche (x=16..1700, centre=858) -->
  <text x="840" y="825" text-anchor="end" fill="${nLabelColor}" font-size="240" font-family="${fontFamily}" font-weight="bold" letter-spacing="4">N°</text>

  <!-- Numéro — couleur propre -->
  <text x="880" y="825" text-anchor="start" fill="${nColor}" font-size="240" font-family="${fontFamily}" font-weight="bold">${escapeXml(numero)}</text>

  <!-- QR Code (réduit: ${QR_SIZE}×${QR_SIZE}) -->
  ${qrSvgContent}

</svg>`;
}


// ============================================================
// DEFAULT PLATE (legacy / no template) — same elegant layout
// ============================================================
function generateDefaultPlateSVG(data: PlateData, qrDataUrl: string): string {
  const commune = data.commune.toUpperCase();
  const quartier = data.quartier.toUpperCase();
  const avenue = prefixAvenue(data.avenue);
  const numero = data.numero;

  const QR_X = 1930;
  const QR_Y = 618;
  const QR_SIZE = 360;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 ${PLATE_WIDTH} ${PLATE_HEIGHT}" width="${PLATE_WIDTH}" height="${PLATE_HEIGHT}">

  <rect x="0" y="0" width="${PLATE_WIDTH}" height="${PLATE_HEIGHT}" rx="24" ry="24" fill="#1a3a6b"/>
  <rect x="16" y="16" width="${PLATE_WIDTH - 32}" height="${PLATE_HEIGHT - 32}" rx="18" ry="18" fill="#1a3a6b"/>
  <rect x="16" y="16" width="${PLATE_WIDTH - 32}" height="${PLATE_HEIGHT - 32}" rx="18" ry="18" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.3"/>

  <!-- DRC Flag -->
  <g transform="translate(120, 40)">
    <rect width="190" height="130" fill="#007FFF" rx="6"/>
    <polygon points="0,92 0,130 149,39 149,0 190,0 190,39 41,130 0,130" fill="#CE1021"/>
    <line x1="0" y1="86" x2="153" y2="0" stroke="#F7D618" stroke-width="5"/>
    <line x1="35" y1="130" x2="190" y2="44" stroke="#F7D618" stroke-width="5"/>
    <polygon points="41,30 46,47 62,47 49,57 54,74 41,64 27,74 32,57 19,47 35,47" fill="#F7D618"/>
  </g>

  <!-- Seal placeholder -->
  <circle cx="2240" cy="100" r="70" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.4"/>
  <circle cx="2240" cy="100" r="52" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.2"/>

  <!-- "COMMUNE DE" label -->
  <text x="1200" y="82" text-anchor="middle" fill="#87CEEB" font-size="50" font-family="Arial, sans-serif" font-weight="600" letter-spacing="3">COMMUNE DE</text>

  <!-- Commune name -->
  <text x="1200" y="172" text-anchor="middle" fill="#ffffff" font-size="90" font-family="Arial, sans-serif" font-weight="bold">${escapeXml(commune)}</text>

  <!-- QUARTIER — au-dessus de la ligne -->
  <text x="1200" y="248" text-anchor="middle" fill="#87CEEB" font-size="56" font-family="Arial, sans-serif" font-weight="600" letter-spacing="2">QUARTIER ${escapeXml(quartier)}</text>

  <!-- Horizontal separator — sous le quartier -->
  <line x1="65" y1="278" x2="2335" y2="278" stroke="#ffffff" stroke-width="2" opacity="0.3"/>

  <!-- Avenue band -->
  <rect x="16" y="294" width="${PLATE_WIDTH - 32}" height="234" rx="0" fill="#2d5a8e"/>
  <text x="1200" y="452" text-anchor="middle" fill="#ffffff" font-size="118" font-family="Arial, sans-serif" font-weight="bold">${escapeXml(avenue)}</text>

  <!-- Vertical separator -->
  <line x1="1700" y1="534" x2="1700" y2="1084" stroke="#ffffff" stroke-width="2" opacity="0.15"/>

  <!-- N° centré dans zone gauche (centre x=858) -->
  <text x="840" y="825" text-anchor="end" fill="#87CEEB" font-size="240" font-family="Arial, sans-serif" font-weight="bold" letter-spacing="4">N°</text>
  <text x="880" y="825" text-anchor="start" fill="#ffffff" font-size="240" font-family="Arial, sans-serif" font-weight="bold">${escapeXml(numero)}</text>

  <!-- QR Code (réduit: ${QR_SIZE}×${QR_SIZE}) -->
  <image x="${QR_X}" y="${QR_Y}" width="${QR_SIZE}" height="${QR_SIZE}" href="${qrDataUrl}"/>

</svg>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
