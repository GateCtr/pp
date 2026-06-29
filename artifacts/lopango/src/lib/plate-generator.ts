import QRCode from "qrcode";
import type { VariantDesign } from "@/db/schema";

// Output: 2953×1417px SVG — corresponds to 25×12cm at 300 DPI (standard address plate)
// Being SVG (vector), it can be printed at any size without quality loss.
const PLATE_WIDTH = 2953;
const PLATE_HEIGHT = 1417;

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
    width: 500,
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
// TEMPLATE-BASED PLATE — layout 2953×1417 (25×12cm @ 300 DPI)
// Layout (all coords scaled from 2400×1100 reference):
//   BORDER    : 20px inner padding
//   Header    : COMMUNE DE (y=106) / Commune (y=222) / QUARTIER (y=320)
//   H-line    : y=358 (below quartier)
//   Avenue    : y=380..682 (h=302), text baseline y=583
//   V-sep     : x=2091 (y=688..1397)
//   Left zone : x=20..2091, centre=1055
//   N°+num    : tspan centré x=1055, y=1063, font=300
//   QR (456²) : x=2361 y=800 (right-aligned in right zone)
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

  const rx = variant.shape === "rectangle" ? "10" : variant.shape === "rounded" ? "30" : "50";
  const innerRx = String(Math.max(0, Number(rx) - 5));

  // Resolve colors with fallbacks for backward compatibility
  const aColor       = escapeXml(variant.avenueColor      || variant.borderColor);
  const aTextColor   = escapeXml(variant.avenueTextColor   || variant.textColor);
  const cNameColor   = escapeXml(variant.communeNameColor  || variant.textColor);
  const nLabelColor  = escapeXml(variant.numeroLabelColor  || variant.accentColor);
  const nColor       = escapeXml(variant.numeroColor       || variant.textColor);
  const hLineColor   = escapeXml(variant.hLineColor        || variant.borderColor);
  const vLineColor   = escapeXml(variant.vLineColor        || variant.borderColor);
  const accentColor  = escapeXml(variant.accentColor);
  const fontFamily   = escapeXml(variant.fontFamily);

  // QR: 380×380, centré dans la zone droite (x=2091..2933, centre x=2512)
  //     et centré verticalement dans la zone basse (y=690..1397, centre y=1044)
  const QR_SIZE = 380;
  const QR_X = 2512 - QR_SIZE / 2;  // = 2322
  const QR_Y = 1044 - QR_SIZE / 2;  // = 854
  const QR_CX = 2512;
  const QR_CY = 1044;

  const qrSvgContent = sealUrl
    ? `<image x="${QR_X}" y="${QR_Y}" width="${QR_SIZE}" height="${QR_SIZE}" href="${qrDataUrl}"/>
       <circle cx="${QR_CX}" cy="${QR_CY}" r="48" fill="white"/>
       <clipPath id="qrSeal"><circle cx="${QR_CX}" cy="${QR_CY}" r="41"/></clipPath>
       <image x="${QR_CX - 41}" y="${QR_CY - 41}" width="82" height="82" href="${escapeXml(sealUrl)}" clip-path="url(#qrSeal)" preserveAspectRatio="xMidYMid slice"/>`
    : `<image x="${QR_X}" y="${QR_Y}" width="${QR_SIZE}" height="${QR_SIZE}" href="${qrDataUrl}"/>`;

  // Flag: centré dans la zone top-left (x=20..700, y=20..360)
  //   Zone centre: x=360, y=190 — Flag 280×200 → x=220, y=90
  const FLAG_X = 220, FLAG_Y = 90, FLAG_W = 280, FLAG_H = 200;
  const flagContent = flagUrl
    ? `<image x="${FLAG_X}" y="${FLAG_Y}" width="${FLAG_W}" height="${FLAG_H}" href="${escapeXml(flagUrl)}" preserveAspectRatio="xMidYMid meet"/>`
    : `<g transform="translate(${FLAG_X}, ${FLAG_Y})">
        <rect width="${FLAG_W}" height="${FLAG_H}" fill="#007FFF" rx="8"/>
        <polygon points="0,141 0,200 232,60 232,0 280,0 280,60 64,200 0,200" fill="#CE1021"/>
        <line x1="0" y1="133" x2="236" y2="0" stroke="#F7D618" stroke-width="7"/>
        <line x1="52" y1="200" x2="280" y2="68" stroke="#F7D618" stroke-width="7"/>
        <polygon points="64,46 71,72 97,72 76,88 83,114 64,98 45,114 52,88 31,72 57,72" fill="#F7D618"/>
      </g>`;

  // Seal: centré dans la zone top-right (x=2600..2933, y=20..360)
  //   Zone centre: x=2766, y=190 — r=115
  const SEAL_CX = 2766;
  const SEAL_CY = 190;
  const SEAL_R  = 115;
  const sealContent = sealUrl
    ? `<clipPath id="plateSeal"><circle cx="${SEAL_CX}" cy="${SEAL_CY}" r="${SEAL_R}"/></clipPath>
       <image x="${SEAL_CX - SEAL_R}" y="${SEAL_CY - SEAL_R}" width="${SEAL_R * 2}" height="${SEAL_R * 2}" href="${escapeXml(sealUrl)}" clip-path="url(#plateSeal)" preserveAspectRatio="xMidYMid slice"/>`
    : `<circle cx="${SEAL_CX}" cy="${SEAL_CY}" r="${SEAL_R}" fill="none" stroke="${escapeXml(variant.borderColor)}" stroke-width="5" opacity="0.5"/>
       <circle cx="${SEAL_CX}" cy="${SEAL_CY}" r="${Math.round(SEAL_R * 0.74)}" fill="none" stroke="${escapeXml(variant.borderColor)}" stroke-width="3" opacity="0.3"/>`;

  const fontStyle = buildFontStyle(variant.fontFamily);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 ${PLATE_WIDTH} ${PLATE_HEIGHT}" width="${PLATE_WIDTH}" height="${PLATE_HEIGHT}">
  ${fontStyle}

  <!-- Outer frame -->
  <rect x="0" y="0" width="${PLATE_WIDTH}" height="${PLATE_HEIGHT}" rx="${rx}" ry="${rx}" fill="${escapeXml(variant.borderColor)}"/>
  <!-- Inner background -->
  <rect x="20" y="20" width="${PLATE_WIDTH - 40}" height="${PLATE_HEIGHT - 40}" rx="${innerRx}" ry="${innerRx}" fill="${escapeXml(variant.bgColor)}"/>

  <!-- Drapeau — centré dans zone top-left (x=20..700, y=20..360) -->
  ${flagContent}

  <!-- Sceau — centré dans zone top-right (x=2600..2933, y=20..360) -->
  ${sealContent}

  <!-- "COMMUNE DE" — accent color — y=108, font=72 -->
  <text x="1477" y="108" text-anchor="middle" fill="${accentColor}" font-size="72" font-family="${fontFamily}" font-weight="600" letter-spacing="4">COMMUNE DE</text>

  <!-- Commune name — couleur propre — y=240, font=130 -->
  <text x="1477" y="240" text-anchor="middle" fill="${cNameColor}" font-size="130" font-family="${fontFamily}" font-weight="bold">${escapeXml(commune)}</text>

  <!-- QUARTIER — accent color — y=325, font=82 — AU-DESSUS de la ligne -->
  <text x="1477" y="325" text-anchor="middle" fill="${accentColor}" font-size="82" font-family="${fontFamily}" font-weight="600" letter-spacing="3">QUARTIER ${escapeXml(quartier)}</text>

  <!-- Horizontal separator — y=362 — SOUS le quartier -->
  <line x1="80" y1="362" x2="2873" y2="362" stroke="${hLineColor}" stroke-width="3" opacity="0.5"/>

  <!-- Avenue band — y=382, h=302 -->
  <rect x="20" y="382" width="${PLATE_WIDTH - 40}" height="302" rx="0" fill="${aColor}"/>

  <!-- Avenue name — baseline y=583 -->
  <text x="1477" y="583" text-anchor="middle" fill="${aTextColor}" font-size="150" font-family="${fontFamily}" font-weight="bold">${escapeXml(avenue)}</text>

  <!-- Vertical separator — x=2091 -->
  <line x1="2091" y1="690" x2="2091" y2="1397" stroke="${vLineColor}" stroke-width="3" opacity="0.3"/>

  <!-- N°+numéro centré dans zone gauche (x=20..2091, centre=1055)
       font=400 (dominant sur QR), tspan = 2 couleurs -->
  <text x="1055" y="1150" text-anchor="middle" font-size="400" font-family="${fontFamily}" font-weight="bold">
    <tspan fill="${nLabelColor}">N° </tspan><tspan fill="${nColor}">${escapeXml(numero)}</tspan>
  </text>

  <!-- QR Code (${QR_SIZE}×${QR_SIZE}, centré en x=2512, y=1044) -->
  ${qrSvgContent}

</svg>`;
}


// ============================================================
// DEFAULT PLATE (legacy / no template) — same layout 2953×1417
// ============================================================
function generateDefaultPlateSVG(data: PlateData, qrDataUrl: string): string {
  const commune = data.commune.toUpperCase();
  const quartier = data.quartier.toUpperCase();
  const avenue = prefixAvenue(data.avenue);
  const numero = data.numero;

  // QR: 380×380 centré dans zone droite (x=2091..2933, cx=2512) et zone basse (cy=1044)
  const QR_SIZE = 380;
  const QR_X = 2512 - QR_SIZE / 2;
  const QR_Y = 1044 - QR_SIZE / 2;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 ${PLATE_WIDTH} ${PLATE_HEIGHT}" width="${PLATE_WIDTH}" height="${PLATE_HEIGHT}">

  <rect x="0" y="0" width="${PLATE_WIDTH}" height="${PLATE_HEIGHT}" rx="30" ry="30" fill="#1a3a6b"/>
  <rect x="20" y="20" width="${PLATE_WIDTH - 40}" height="${PLATE_HEIGHT - 40}" rx="24" ry="24" fill="#1a3a6b"/>
  <rect x="20" y="20" width="${PLATE_WIDTH - 40}" height="${PLATE_HEIGHT - 40}" rx="24" ry="24" fill="none" stroke="#ffffff" stroke-width="5" opacity="0.3"/>

  <!-- Drapeau — centré dans zone top-left (x=20..700, y=20..360) -->
  <g transform="translate(220, 90)">
    <rect width="280" height="200" fill="#007FFF" rx="8"/>
    <polygon points="0,141 0,200 232,60 232,0 280,0 280,60 64,200 0,200" fill="#CE1021"/>
    <line x1="0" y1="133" x2="236" y2="0" stroke="#F7D618" stroke-width="7"/>
    <line x1="52" y1="200" x2="280" y2="68" stroke="#F7D618" stroke-width="7"/>
    <polygon points="64,46 71,72 97,72 76,88 83,114 64,98 45,114 52,88 31,72 57,72" fill="#F7D618"/>
  </g>

  <!-- Sceau — centré dans zone top-right (cx=2766, cy=190, r=115) -->
  <circle cx="2766" cy="190" r="115" fill="none" stroke="#ffffff" stroke-width="5" opacity="0.4"/>
  <circle cx="2766" cy="190" r="85" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.2"/>

  <!-- "COMMUNE DE" label — y=108, font=72 -->
  <text x="1477" y="108" text-anchor="middle" fill="#87CEEB" font-size="72" font-family="Arial, sans-serif" font-weight="600" letter-spacing="4">COMMUNE DE</text>

  <!-- Commune name — y=240, font=130 -->
  <text x="1477" y="240" text-anchor="middle" fill="#ffffff" font-size="130" font-family="Arial, sans-serif" font-weight="bold">${escapeXml(commune)}</text>

  <!-- QUARTIER — y=325, font=82 — au-dessus de la ligne -->
  <text x="1477" y="325" text-anchor="middle" fill="#87CEEB" font-size="82" font-family="Arial, sans-serif" font-weight="600" letter-spacing="3">QUARTIER ${escapeXml(quartier)}</text>

  <!-- Horizontal separator — y=362 -->
  <line x1="80" y1="362" x2="2873" y2="362" stroke="#ffffff" stroke-width="3" opacity="0.3"/>

  <!-- Avenue band — y=382, h=302 -->
  <rect x="20" y="382" width="${PLATE_WIDTH - 40}" height="302" rx="0" fill="#2d5a8e"/>
  <text x="1477" y="583" text-anchor="middle" fill="#ffffff" font-size="150" font-family="Arial, sans-serif" font-weight="bold">${escapeXml(avenue)}</text>

  <!-- Vertical separator — x=2091 -->
  <line x1="2091" y1="690" x2="2091" y2="1397" stroke="#ffffff" stroke-width="3" opacity="0.15"/>

  <!-- N°+numéro centré dans zone gauche (centre x=1055) — font=400 dominant -->
  <text x="1055" y="1150" text-anchor="middle" font-size="400" font-family="Arial, sans-serif" font-weight="bold">
    <tspan fill="#87CEEB">N° </tspan><tspan fill="#ffffff">${escapeXml(numero)}</tspan>
  </text>

  <!-- QR Code (${QR_SIZE}×${QR_SIZE}, centré en x=2512, y=1044) -->
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
