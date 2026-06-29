import QRCode from "qrcode";
import type { VariantDesign } from "@/db/schema";

// Output: 2400x1400px SVG (print quality @ 300 DPI for ~20x12cm plate)
const PLATE_WIDTH = 2400;
const PLATE_HEIGHT = 1400;

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

// Template-based plate SVG — 2400×1400
function generateTemplatePlateSVG(
  data: PlateData,
  qrDataUrl: string,
  config: TemplateConfig
): string {
  const { variant, flagUrl, sealUrl } = config;
  const commune = data.commune.toUpperCase();
  const quartier = data.quartier.toUpperCase();
  const avenue = prefixAvenue(data.avenue);
  const numero = `N° ${data.numero}`;

  // District label: e.g. "VILLE DE MATADI" or "TERRITOIRE DE MBANZA-NGUNGU"
  const districtLine = data.districtLabel
    ? data.districtLabel.toUpperCase()
    : data.district
    ? data.district.toUpperCase()
    : null;

  const rx = variant.shape === "rectangle" ? "8" : variant.shape === "rounded" ? "24" : "40";
  const innerRx = String(Math.max(0, Number(rx) - 4));

  const hColor = escapeXml(variant.headerColor || variant.accentColor);
  const aColor = escapeXml(variant.avenueColor || variant.borderColor);
  const aOpacity = variant.avenueColor ? "1" : "0.15";

  // QR: 280×280, right side, centered around y=1040
  const qrSvgContent = sealUrl
    ? `<image x="2044" y="900" width="280" height="280" href="${qrDataUrl}"/>
       <circle cx="2184" cy="1040" r="44" fill="white"/>
       <clipPath id="qrSeal"><circle cx="2184" cy="1040" r="36"/></clipPath>
       <image x="2148" y="1004" width="72" height="72" href="${escapeXml(sealUrl)}" clip-path="url(#qrSeal)" preserveAspectRatio="xMidYMid slice"/>`
    : `<image x="2044" y="900" width="280" height="280" href="${qrDataUrl}"/>`;

  const flagContent = flagUrl
    ? `<image x="100" y="90" width="260" height="185" href="${escapeXml(flagUrl)}" preserveAspectRatio="xMidYMid meet"/>`
    : `<g transform="translate(100, 90)">
        <rect width="260" height="185" fill="#007FFF" rx="10"/>
        <polygon points="0,130 0,185 204,56 204,0 260,0 260,56 56,185 0,185" fill="#CE1021"/>
        <line x1="0" y1="122" x2="210" y2="0" stroke="#F7D618" stroke-width="7"/>
        <line x1="48" y1="185" x2="260" y2="63" stroke="#F7D618" stroke-width="7"/>
        <polygon points="56,44 63,67 85,67 67,81 74,104 56,90 37,104 44,81 26,67 48,67" fill="#F7D618"/>
      </g>`;

  const sealContent = sealUrl
    ? `<clipPath id="plateSeal"><circle cx="2120" cy="183" r="96"/></clipPath>
       <image x="2024" y="87" width="192" height="192" href="${escapeXml(sealUrl)}" clip-path="url(#plateSeal)" preserveAspectRatio="xMidYMid slice"/>`
    : `<circle cx="2120" cy="183" r="96" fill="none" stroke="${escapeXml(variant.borderColor)}" stroke-width="4"/>
       <circle cx="2120" cy="183" r="76" fill="none" stroke="${escapeXml(variant.borderColor)}" stroke-width="2"/>`;

  // Header text Y positions
  const repY = 68;
  const prY = 116;
  const villeY = districtLine ? 178 : 0;
  const communeDeY = districtLine ? 258 : 185;
  const communeY = districtLine ? 348 : 275;
  const quartierY = districtLine ? 434 : 365;

  const districtBlock = districtLine
    ? `<text x="1200" y="${villeY}" text-anchor="middle" fill="${hColor}" font-size="64" font-family="${escapeXml(variant.fontFamily)}" font-weight="bold">
    ${escapeXml(districtLine)}
  </text>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 ${PLATE_WIDTH} ${PLATE_HEIGHT}" width="${PLATE_WIDTH}" height="${PLATE_HEIGHT}">
  <!-- Background plate -->
  <rect x="0" y="0" width="${PLATE_WIDTH}" height="${PLATE_HEIGHT}" rx="${rx}" ry="${rx}" fill="${escapeXml(variant.borderColor)}"/>
  <rect x="16" y="16" width="${PLATE_WIDTH - 32}" height="${PLATE_HEIGHT - 32}" rx="${innerRx}" ry="${innerRx}" fill="${escapeXml(variant.bgColor)}"/>

  <!-- Flag -->
  ${flagContent}

  <!-- Seal (always round) -->
  ${sealContent}

  <!-- REP. DEM. CONGO -->
  <text x="1200" y="${repY}" text-anchor="middle" fill="${hColor}" font-size="38" font-family="${escapeXml(variant.fontFamily)}" font-weight="normal" letter-spacing="2">
    REP. DEM. CONGO
  </text>

  <!-- PR. KONGO-CENTRALE -->
  <text x="1200" y="${prY}" text-anchor="middle" fill="${hColor}" font-size="38" font-family="${escapeXml(variant.fontFamily)}" font-weight="normal" letter-spacing="1">
    PR. KONGO-CENTRALE
  </text>

  <!-- VILLE/TERRITOIRE DE xxx (si disponible) -->
  ${districtBlock}

  <!-- COMMUNE DE -->
  <text x="1200" y="${communeDeY}" text-anchor="middle" fill="${escapeXml(variant.accentColor)}" font-size="50" font-family="${escapeXml(variant.fontFamily)}" font-weight="normal">
    COMMUNE DE
  </text>

  <!-- Commune name -->
  <text x="1200" y="${communeY}" text-anchor="middle" fill="${escapeXml(variant.textColor)}" font-size="82" font-family="${escapeXml(variant.fontFamily)}" font-weight="bold">
    ${escapeXml(commune)}
  </text>

  <!-- Quartier -->
  <text x="1200" y="${quartierY}" text-anchor="middle" fill="${escapeXml(variant.accentColor)}" font-size="58" font-family="${escapeXml(variant.fontFamily)}" font-weight="bold">
    QUARTIER ${escapeXml(quartier)}
  </text>

  <!-- Avenue band -->
  <rect x="40" y="${quartierY + 24}" width="${PLATE_WIDTH - 80}" height="210" rx="16" fill="${aColor}" opacity="${aOpacity}"/>

  <!-- Avenue name -->
  <text x="1200" y="${quartierY + 148}" text-anchor="middle" fill="${escapeXml(variant.textColor)}" font-size="104" font-family="${escapeXml(variant.fontFamily)}" font-weight="bold">
    ${escapeXml(avenue)}
  </text>

  <!-- Numero -->
  <text x="1200" y="1270" text-anchor="middle" fill="${escapeXml(variant.accentColor)}" font-size="200" font-family="${escapeXml(variant.fontFamily)}" font-weight="bold">
    ${escapeXml(numero)}
  </text>

  <!-- QR Code -->
  ${qrSvgContent}
</svg>`;
}


// Default plate SVG (legacy, no template) — also 2400×1400
function generateDefaultPlateSVG(data: PlateData, qrDataUrl: string): string {
  const commune = data.commune.toUpperCase();
  const quartier = data.quartier.toUpperCase();
  const avenue = prefixAvenue(data.avenue);
  const numero = `N° ${data.numero}`;
  const districtLine = data.districtLabel
    ? data.districtLabel.toUpperCase()
    : data.district
    ? data.district.toUpperCase()
    : null;

  const villeY = districtLine ? 178 : 0;
  const communeDeY = districtLine ? 258 : 185;
  const communeY = districtLine ? 348 : 275;
  const quartierY = districtLine ? 434 : 365;

  const districtBlock = districtLine
    ? `<text x="1200" y="${villeY}" text-anchor="middle" fill="#87CEEB" font-size="64" font-family="Arial, sans-serif" font-weight="bold">${escapeXml(districtLine)}</text>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 ${PLATE_WIDTH} ${PLATE_HEIGHT}" width="${PLATE_WIDTH}" height="${PLATE_HEIGHT}">
  <rect x="0" y="0" width="${PLATE_WIDTH}" height="${PLATE_HEIGHT}" rx="48" ry="48" fill="#1a3a6b"/>
  <rect x="16" y="16" width="${PLATE_WIDTH - 32}" height="${PLATE_HEIGHT - 32}" rx="40" ry="40" fill="none" stroke="#ffffff" stroke-width="8"/>
  <g transform="translate(100, 90)">
    <rect width="260" height="185" fill="#007FFF" rx="10"/>
    <polygon points="0,130 0,185 204,56 204,0 260,0 260,56 56,185 0,185" fill="#CE1021"/>
    <line x1="0" y1="122" x2="210" y2="0" stroke="#F7D618" stroke-width="7"/>
    <line x1="48" y1="185" x2="260" y2="63" stroke="#F7D618" stroke-width="7"/>
    <polygon points="56,44 63,67 85,67 67,81 74,104 56,90 37,104 44,81 26,67 48,67" fill="#F7D618"/>
  </g>
  <circle cx="2120" cy="183" r="96" fill="none" stroke="#ffffff" stroke-width="6"/>
  <circle cx="2120" cy="183" r="76" fill="none" stroke="#ffffff" stroke-width="2"/>
  <text x="1200" y="68" text-anchor="middle" fill="#87CEEB" font-size="38" font-family="Arial, sans-serif" letter-spacing="2">REP. DEM. CONGO</text>
  <text x="1200" y="116" text-anchor="middle" fill="#87CEEB" font-size="38" font-family="Arial, sans-serif" letter-spacing="1">PR. KONGO-CENTRALE</text>
  ${districtBlock}
  <text x="1200" y="${communeDeY}" text-anchor="middle" fill="#87CEEB" font-size="50" font-family="Arial, sans-serif">COMMUNE DE</text>
  <text x="1200" y="${communeY}" text-anchor="middle" fill="#ffffff" font-size="82" font-family="Arial, sans-serif" font-weight="bold">${escapeXml(commune)}</text>
  <text x="1200" y="${quartierY}" text-anchor="middle" fill="#87CEEB" font-size="58" font-family="Arial, sans-serif" font-weight="bold">QUARTIER ${escapeXml(quartier)}</text>
  <rect x="40" y="${quartierY + 24}" width="${PLATE_WIDTH - 80}" height="210" rx="16" fill="#ffffff" opacity="0.12"/>
  <text x="1200" y="${quartierY + 148}" text-anchor="middle" fill="#ffffff" font-size="104" font-family="Arial, sans-serif" font-weight="bold">${escapeXml(avenue)}</text>
  <text x="1200" y="1270" text-anchor="middle" fill="#87CEEB" font-size="200" font-family="Arial, sans-serif" font-weight="bold">${escapeXml(numero)}</text>
  <image x="2044" y="900" width="280" height="280" href="${qrDataUrl}"/>
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
