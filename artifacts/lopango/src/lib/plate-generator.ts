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

// ============================================================
// TEMPLATE-BASED PLATE — elegant professional layout 2400×1100
// Layout:
//   Top    : flag (left) | COMMUNE DE [xxx] (center) | seal (right)
//   Sub    : thin separator + QUARTIER [xxx]
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

  const aColor = escapeXml(variant.avenueColor || variant.borderColor);

  // QR: bottom-right, 490×490 starting at (1860, 570)
  const qrSvgContent = sealUrl
    ? `<image x="1860" y="570" width="490" height="490" href="${qrDataUrl}"/>
       <circle cx="2105" cy="815" r="52" fill="white"/>
       <clipPath id="qrSeal"><circle cx="2105" cy="815" r="44"/></clipPath>
       <image x="2061" y="771" width="88" height="88" href="${escapeXml(sealUrl)}" clip-path="url(#qrSeal)" preserveAspectRatio="xMidYMid slice"/>`
    : `<image x="1860" y="570" width="490" height="490" href="${qrDataUrl}"/>`;

  const flagContent = flagUrl
    ? `<image x="65" y="30" width="190" height="130" href="${escapeXml(flagUrl)}" preserveAspectRatio="xMidYMid meet"/>`
    : `<g transform="translate(65, 30)">
        <rect width="190" height="130" fill="#007FFF" rx="6"/>
        <polygon points="0,92 0,130 149,39 149,0 190,0 190,39 41,130 0,130" fill="#CE1021"/>
        <line x1="0" y1="86" x2="153" y2="0" stroke="#F7D618" stroke-width="5"/>
        <line x1="35" y1="130" x2="190" y2="44" stroke="#F7D618" stroke-width="5"/>
        <polygon points="41,30 46,47 62,47 49,57 54,74 41,64 27,74 32,57 19,47 35,47" fill="#F7D618"/>
      </g>`;

  const sealContent = sealUrl
    ? `<clipPath id="plateSeal"><circle cx="2300" cy="95" r="80"/></clipPath>
       <image x="2220" y="15" width="160" height="160" href="${escapeXml(sealUrl)}" clip-path="url(#plateSeal)" preserveAspectRatio="xMidYMid slice"/>`
    : `<circle cx="2300" cy="95" r="80" fill="none" stroke="${escapeXml(variant.borderColor)}" stroke-width="4" opacity="0.5"/>
       <circle cx="2300" cy="95" r="60" fill="none" stroke="${escapeXml(variant.borderColor)}" stroke-width="2" opacity="0.3"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 ${PLATE_WIDTH} ${PLATE_HEIGHT}" width="${PLATE_WIDTH}" height="${PLATE_HEIGHT}">

  <!-- Outer frame -->
  <rect x="0" y="0" width="${PLATE_WIDTH}" height="${PLATE_HEIGHT}" rx="${rx}" ry="${rx}" fill="${escapeXml(variant.borderColor)}"/>
  <!-- Inner background -->
  <rect x="16" y="16" width="${PLATE_WIDTH - 32}" height="${PLATE_HEIGHT - 32}" rx="${innerRx}" ry="${innerRx}" fill="${escapeXml(variant.bgColor)}"/>

  <!-- Flag (top left) -->
  ${flagContent}

  <!-- Seal (top right) -->
  ${sealContent}

  <!-- Horizontal separator (below flag/seal) -->
  <line x1="65" y1="200" x2="2335" y2="200" stroke="${escapeXml(variant.borderColor)}" stroke-width="2" opacity="0.25"/>

  <!-- QUARTIER -->
  <text x="1200" y="265" text-anchor="middle" fill="${escapeXml(variant.accentColor)}" font-size="60" font-family="${escapeXml(variant.fontFamily)}" font-weight="600" letter-spacing="2">QUARTIER ${escapeXml(quartier)}</text>

  <!-- Avenue band (full inner width) -->
  <rect x="16" y="300" width="${PLATE_WIDTH - 32}" height="250" rx="0" fill="${aColor}"/>

  <!-- Avenue name (centered on band) -->
  <text x="1200" y="450" text-anchor="middle" fill="${escapeXml(variant.textColor)}" font-size="118" font-family="${escapeXml(variant.fontFamily)}" font-weight="bold">${escapeXml(avenue)}</text>

  <!-- Bottom: vertical separator -->
  <line x1="1600" y1="565" x2="1600" y2="1080" stroke="${escapeXml(variant.borderColor)}" stroke-width="2" opacity="0.15"/>

  <!-- N° label -->
  <text x="810" y="660" text-anchor="middle" fill="${escapeXml(variant.accentColor)}" font-size="56" font-family="${escapeXml(variant.fontFamily)}" font-weight="normal" letter-spacing="4">N°</text>

  <!-- Numero (large) -->
  <text x="810" y="985" text-anchor="middle" fill="${escapeXml(variant.textColor)}" font-size="280" font-family="${escapeXml(variant.fontFamily)}" font-weight="bold">${escapeXml(numero)}</text>

  <!-- QR Code -->
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

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 ${PLATE_WIDTH} ${PLATE_HEIGHT}" width="${PLATE_WIDTH}" height="${PLATE_HEIGHT}">

  <rect x="0" y="0" width="${PLATE_WIDTH}" height="${PLATE_HEIGHT}" rx="24" ry="24" fill="#1a3a6b"/>
  <rect x="16" y="16" width="${PLATE_WIDTH - 32}" height="${PLATE_HEIGHT - 32}" rx="18" ry="18" fill="#1a3a6b"/>
  <rect x="16" y="16" width="${PLATE_WIDTH - 32}" height="${PLATE_HEIGHT - 32}" rx="18" ry="18" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.3"/>

  <!-- DRC Flag -->
  <g transform="translate(65, 30)">
    <rect width="190" height="130" fill="#007FFF" rx="6"/>
    <polygon points="0,92 0,130 149,39 149,0 190,0 190,39 41,130 0,130" fill="#CE1021"/>
    <line x1="0" y1="86" x2="153" y2="0" stroke="#F7D618" stroke-width="5"/>
    <line x1="35" y1="130" x2="190" y2="44" stroke="#F7D618" stroke-width="5"/>
    <polygon points="41,30 46,47 62,47 49,57 54,74 41,64 27,74 32,57 19,47 35,47" fill="#F7D618"/>
  </g>

  <circle cx="2300" cy="95" r="80" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.4"/>
  <circle cx="2300" cy="95" r="60" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.2"/>

  <line x1="65" y1="200" x2="2335" y2="200" stroke="#ffffff" stroke-width="2" opacity="0.2"/>
  <text x="1200" y="265" text-anchor="middle" fill="#87CEEB" font-size="60" font-family="Arial, sans-serif" font-weight="600" letter-spacing="2">QUARTIER ${escapeXml(quartier)}</text>

  <rect x="16" y="300" width="${PLATE_WIDTH - 32}" height="250" rx="0" fill="#2d5a8e"/>
  <text x="1200" y="450" text-anchor="middle" fill="#ffffff" font-size="118" font-family="Arial, sans-serif" font-weight="bold">${escapeXml(avenue)}</text>

  <line x1="1600" y1="565" x2="1600" y2="1080" stroke="#ffffff" stroke-width="2" opacity="0.12"/>

  <text x="810" y="660" text-anchor="middle" fill="#87CEEB" font-size="56" font-family="Arial, sans-serif" letter-spacing="4">N°</text>
  <text x="810" y="985" text-anchor="middle" fill="#ffffff" font-size="280" font-family="Arial, sans-serif" font-weight="bold">${escapeXml(numero)}</text>

  <image x="1860" y="570" width="490" height="490" href="${qrDataUrl}"/>

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
