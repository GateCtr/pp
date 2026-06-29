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

  // QR: right edge = seal right (cx=2240, r=70 → 2310); x=1820, w=490
  const qrSvgContent = sealUrl
    ? `<image x="1820" y="582" width="490" height="490" href="${qrDataUrl}"/>
       <circle cx="2065" cy="827" r="52" fill="white"/>
       <clipPath id="qrSeal"><circle cx="2065" cy="827" r="44"/></clipPath>
       <image x="2021" y="783" width="88" height="88" href="${escapeXml(sealUrl)}" clip-path="url(#qrSeal)" preserveAspectRatio="xMidYMid slice"/>`
    : `<image x="1820" y="582" width="490" height="490" href="${qrDataUrl}"/>`;

  // Flag: margin from left (x=120) and top (y=45 → 29px inside inner rect)
  const flagContent = flagUrl
    ? `<image x="120" y="45" width="190" height="130" href="${escapeXml(flagUrl)}" preserveAspectRatio="xMidYMid meet"/>`
    : `<g transform="translate(120, 45)">
        <rect width="190" height="130" fill="#007FFF" rx="6"/>
        <polygon points="0,92 0,130 149,39 149,0 190,0 190,39 41,130 0,130" fill="#CE1021"/>
        <line x1="0" y1="86" x2="153" y2="0" stroke="#F7D618" stroke-width="5"/>
        <line x1="35" y1="130" x2="190" y2="44" stroke="#F7D618" stroke-width="5"/>
        <polygon points="41,30 46,47 62,47 49,57 54,74 41,64 27,74 32,57 19,47 35,47" fill="#F7D618"/>
      </g>`;

  // Seal: margin from right (cx=2240, r=70 → right=2310, 74px from inner right=2384)
  //       margin from top (cy=100, r=70 → top=30, 14px inside inner rect at y=16)
  const sealContent = sealUrl
    ? `<clipPath id="plateSeal"><circle cx="2240" cy="100" r="70"/></clipPath>
       <image x="2170" y="30" width="140" height="140" href="${escapeXml(sealUrl)}" clip-path="url(#plateSeal)" preserveAspectRatio="xMidYMid slice"/>`
    : `<circle cx="2240" cy="100" r="70" fill="none" stroke="${escapeXml(variant.borderColor)}" stroke-width="4" opacity="0.5"/>
       <circle cx="2240" cy="100" r="52" fill="none" stroke="${escapeXml(variant.borderColor)}" stroke-width="2" opacity="0.3"/>`;

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

  <!-- "COMMUNE DE" label -->
  <text x="1200" y="155" text-anchor="middle" fill="${escapeXml(variant.accentColor)}" font-size="55" font-family="${escapeXml(variant.fontFamily)}" font-weight="600" letter-spacing="3">COMMUNE DE</text>

  <!-- Commune name -->
  <text x="1200" y="218" text-anchor="middle" fill="${escapeXml(variant.textColor)}" font-size="95" font-family="${escapeXml(variant.fontFamily)}" font-weight="bold">${escapeXml(commune)}</text>

  <!-- Horizontal separator -->
  <line x1="65" y1="252" x2="2335" y2="252" stroke="${escapeXml(variant.borderColor)}" stroke-width="2" opacity="0.25"/>

  <!-- QUARTIER -->
  <text x="1200" y="305" text-anchor="middle" fill="${escapeXml(variant.accentColor)}" font-size="60" font-family="${escapeXml(variant.fontFamily)}" font-weight="600" letter-spacing="2">QUARTIER ${escapeXml(quartier)}</text>

  <!-- Avenue band (full inner width) -->
  <rect x="16" y="338" width="${PLATE_WIDTH - 32}" height="238" rx="0" fill="${aColor}"/>

  <!-- Avenue name (centered on band) -->
  <text x="1200" y="478" text-anchor="middle" fill="${escapeXml(variant.textColor)}" font-size="118" font-family="${escapeXml(variant.fontFamily)}" font-weight="bold">${escapeXml(avenue)}</text>

  <!-- Bottom: vertical separator -->
  <line x1="1600" y1="590" x2="1600" y2="1080" stroke="${escapeXml(variant.borderColor)}" stroke-width="2" opacity="0.15"/>

  <!-- N° and numero on same line, centered in left zone -->
  <text x="775" y="830" text-anchor="end" fill="${escapeXml(variant.accentColor)}" font-size="240" font-family="${escapeXml(variant.fontFamily)}" font-weight="bold" letter-spacing="4">N°</text>
  <text x="830" y="830" text-anchor="start" fill="${escapeXml(variant.textColor)}" font-size="240" font-family="${escapeXml(variant.fontFamily)}" font-weight="bold">${escapeXml(numero)}</text>

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

  <!-- DRC Flag (margin from left x=120 and top y=45) -->
  <g transform="translate(120, 45)">
    <rect width="190" height="130" fill="#007FFF" rx="6"/>
    <polygon points="0,92 0,130 149,39 149,0 190,0 190,39 41,130 0,130" fill="#CE1021"/>
    <line x1="0" y1="86" x2="153" y2="0" stroke="#F7D618" stroke-width="5"/>
    <line x1="35" y1="130" x2="190" y2="44" stroke="#F7D618" stroke-width="5"/>
    <polygon points="41,30 46,47 62,47 49,57 54,74 41,64 27,74 32,57 19,47 35,47" fill="#F7D618"/>
  </g>

  <!-- Seal placeholder (cx=2240, cy=100, r=70 → right=2310, top=30) -->
  <circle cx="2240" cy="100" r="70" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.4"/>
  <circle cx="2240" cy="100" r="52" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.2"/>

  <!-- "COMMUNE DE" label -->
  <text x="1200" y="155" text-anchor="middle" fill="#87CEEB" font-size="55" font-family="Arial, sans-serif" font-weight="600" letter-spacing="3">COMMUNE DE</text>

  <!-- Commune name -->
  <text x="1200" y="218" text-anchor="middle" fill="#ffffff" font-size="95" font-family="Arial, sans-serif" font-weight="bold">${escapeXml(commune)}</text>

  <line x1="65" y1="252" x2="2335" y2="252" stroke="#ffffff" stroke-width="2" opacity="0.2"/>
  <text x="1200" y="305" text-anchor="middle" fill="#87CEEB" font-size="60" font-family="Arial, sans-serif" font-weight="600" letter-spacing="2">QUARTIER ${escapeXml(quartier)}</text>

  <rect x="16" y="338" width="${PLATE_WIDTH - 32}" height="238" rx="0" fill="#2d5a8e"/>
  <text x="1200" y="478" text-anchor="middle" fill="#ffffff" font-size="118" font-family="Arial, sans-serif" font-weight="bold">${escapeXml(avenue)}</text>

  <line x1="1600" y1="590" x2="1600" y2="1080" stroke="#ffffff" stroke-width="2" opacity="0.12"/>

  <!-- N° and numero on same line -->
  <text x="775" y="830" text-anchor="end" fill="#87CEEB" font-size="240" font-family="Arial, sans-serif" font-weight="bold" letter-spacing="4">N°</text>
  <text x="830" y="830" text-anchor="start" fill="#ffffff" font-size="240" font-family="Arial, sans-serif" font-weight="bold">${escapeXml(numero)}</text>

  <image x="1820" y="582" width="490" height="490" href="${qrDataUrl}"/>

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
