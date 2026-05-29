import QRCode from "qrcode";
import sharp from "sharp";
import type { VariantDesign } from "@/db/schema";

// Output: 2400x1200px PNG (print quality @ 300 DPI for ~20x10cm plate)
const PLATE_WIDTH = 2400;
const PLATE_HEIGHT = 1200;

interface PlateData {
  id: string;
  commune: string;
  quartier: string;
  avenue: string;
  numero: string;
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

// Main function with template support — outputs PNG
export async function generatePlateWithTemplate(
  data: PlateData,
  templateConfig?: TemplateConfig
): Promise<{
  plaqueUrl: string;
  qrCodeUrl: string;
}> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationUrl = `${appUrl}/verification/${data.id}`;

  // Generate QR code as PNG buffer (high res)
  const qrBuffer = await QRCode.toBuffer(verificationUrl, {
    width: 400,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
    errorCorrectionLevel: templateConfig?.sealUrl ? "H" : "M",
    type: "png",
  });

  // Generate QR as data URL for embedding in SVG
  const qrDataUrl = `data:image/png;base64,${qrBuffer.toString("base64")}`;

  // Generate plate SVG at high resolution
  const plateSvg = templateConfig
    ? generateTemplatePlateSVG(data, qrDataUrl, templateConfig)
    : generateDefaultPlateSVG(data, qrDataUrl);

  // Convert SVG to high-definition PNG using sharp
  const pngBuffer = await sharp(Buffer.from(plateSvg))
    .resize(PLATE_WIDTH, PLATE_HEIGHT)
    .png({ quality: 100, compressionLevel: 6 })
    .toBuffer();

  // Store as base64 PNG data URL (or upload to R2 in production)
  const plateDataUrl = `data:image/png;base64,${pngBuffer.toString("base64")}`;

  // QR code as separate PNG data URL
  const qrPngUrl = `data:image/png;base64,${qrBuffer.toString("base64")}`;

  return {
    plaqueUrl: plateDataUrl,
    qrCodeUrl: qrPngUrl,
  };
}


// Template-based plate SVG (will be converted to PNG)
function generateTemplatePlateSVG(
  data: PlateData,
  qrDataUrl: string,
  config: TemplateConfig
): string {
  const { variant, flagUrl, sealUrl } = config;
  const commune = data.commune.toUpperCase();
  const quartier = data.quartier.toUpperCase();
  const avenue = data.avenue.toUpperCase();
  const numero = `N° ${data.numero}`;
  const rx = variant.shape === "rectangle" ? "8" : variant.shape === "rounded" ? "24" : "40";
  const innerRx = String(Math.max(0, Number(rx) - 4));

  const qrSvgContent = sealUrl
    ? `<image x="1800" y="780" width="440" height="440" href="${qrDataUrl}"/>
       <circle cx="2020" cy="1000" r="72" fill="white"/>
       <clipPath id="qrSeal"><circle cx="2020" cy="1000" r="60"/></clipPath>
       <image x="1960" y="940" width="120" height="120" href="${escapeXml(sealUrl)}" clip-path="url(#qrSeal)" preserveAspectRatio="xMidYMid slice"/>`
    : `<image x="1800" y="800" width="400" height="400" href="${qrDataUrl}"/>`;

  const flagContent = flagUrl
    ? `<image x="100" y="80" width="280" height="200" href="${escapeXml(flagUrl)}" preserveAspectRatio="xMidYMid meet"/>`
    : `<g transform="translate(100, 80)">
        <rect width="280" height="200" fill="#007FFF" rx="12"/>
        <polygon points="0,140 0,200 220,60 220,0 280,0 280,60 60,200 0,200" fill="#CE1021"/>
        <line x1="0" y1="132" x2="228" y2="0" stroke="#F7D618" stroke-width="8"/>
        <line x1="52" y1="200" x2="280" y2="68" stroke="#F7D618" stroke-width="8"/>
        <polygon points="60,48 68,72 92,72 72,88 80,112 60,96 40,112 48,88 28,72 52,72" fill="#F7D618"/>
      </g>`;

  const sealContent = sealUrl
    ? `<clipPath id="plateSeal"><circle cx="2120" cy="180" r="100"/></clipPath>
       <image x="2020" y="80" width="200" height="200" href="${escapeXml(sealUrl)}" clip-path="url(#plateSeal)" preserveAspectRatio="xMidYMid slice"/>`
    : `<circle cx="2120" cy="180" r="100" fill="none" stroke="${escapeXml(variant.borderColor)}" stroke-width="4"/>
       <circle cx="2120" cy="180" r="80" fill="none" stroke="${escapeXml(variant.borderColor)}" stroke-width="2"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 2400 1200" width="2400" height="1200">
  <!-- Background plate -->
  <rect x="0" y="0" width="2400" height="1200" rx="${rx}" ry="${rx}" fill="${escapeXml(variant.borderColor)}"/>
  <rect x="16" y="16" width="2368" height="1168" rx="${innerRx}" ry="${innerRx}" fill="${escapeXml(variant.bgColor)}"/>
  
  <!-- Flag -->
  ${flagContent}
  
  <!-- Seal (always round) -->
  ${sealContent}
  
  <!-- COMMUNE DE text -->
  <text x="1200" y="140" text-anchor="middle" fill="${escapeXml(variant.accentColor)}" font-size="56" font-family="${escapeXml(variant.fontFamily)}" font-weight="normal">
    COMMUNE DE
  </text>
  
  <!-- Commune name -->
  <text x="1200" y="240" text-anchor="middle" fill="${escapeXml(variant.textColor)}" font-size="88" font-family="${escapeXml(variant.fontFamily)}" font-weight="bold">
    ${escapeXml(commune)}
  </text>
  
  <!-- Quartier -->
  <text x="1200" y="380" text-anchor="middle" fill="${escapeXml(variant.accentColor)}" font-size="64" font-family="${escapeXml(variant.fontFamily)}" font-weight="bold">
    QUARTIER ${escapeXml(quartier)}
  </text>
  
  <!-- Separator line -->
  <line x1="200" y1="440" x2="2200" y2="440" stroke="${escapeXml(variant.borderColor)}" stroke-width="4" opacity="0.5"/>
  
  <!-- Avenue name -->
  <text x="1200" y="620" text-anchor="middle" fill="${escapeXml(variant.textColor)}" font-size="112" font-family="${escapeXml(variant.fontFamily)}" font-weight="bold">
    ${escapeXml(avenue)}
  </text>
  
  <!-- Separator line -->
  <line x1="200" y1="700" x2="2200" y2="700" stroke="${escapeXml(variant.borderColor)}" stroke-width="4" opacity="0.5"/>
  
  <!-- Numero -->
  <text x="1000" y="1020" text-anchor="middle" fill="${escapeXml(variant.textColor)}" font-size="192" font-family="${escapeXml(variant.fontFamily)}" font-weight="bold">
    ${escapeXml(numero)}
  </text>
  
  <!-- QR Code -->
  ${qrSvgContent}
</svg>`;
}


// Default plate SVG (legacy, no template)
function generateDefaultPlateSVG(data: PlateData, qrDataUrl: string): string {
  const commune = data.commune.toUpperCase();
  const quartier = data.quartier.toUpperCase();
  const avenue = data.avenue.toUpperCase();
  const numero = `N° ${data.numero}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     viewBox="0 0 2400 1200" width="2400" height="1200">
  <rect x="0" y="0" width="2400" height="1200" rx="48" ry="48" fill="#1a3a6b"/>
  <rect x="16" y="16" width="2368" height="1168" rx="40" ry="40" fill="none" stroke="#ffffff" stroke-width="8"/>
  <g transform="translate(100, 80)">
    <rect width="280" height="200" fill="#007FFF" rx="12"/>
    <polygon points="0,140 0,200 220,60 220,0 280,0 280,60 60,200 0,200" fill="#CE1021"/>
    <line x1="0" y1="132" x2="228" y2="0" stroke="#F7D618" stroke-width="8"/>
    <line x1="52" y1="200" x2="280" y2="68" stroke="#F7D618" stroke-width="8"/>
    <polygon points="60,48 68,72 92,72 72,88 80,112 60,96 40,112 48,88 28,72 52,72" fill="#F7D618"/>
  </g>
  <circle cx="2120" cy="180" r="100" fill="none" stroke="#ffffff" stroke-width="6"/>
  <circle cx="2120" cy="180" r="80" fill="none" stroke="#ffffff" stroke-width="2"/>
  <text x="1200" y="140" text-anchor="middle" fill="#ffffff" font-size="56" font-family="Arial, sans-serif">COMMUNE DE</text>
  <text x="1200" y="240" text-anchor="middle" fill="#ffffff" font-size="88" font-family="Arial, sans-serif" font-weight="bold">${escapeXml(commune)}</text>
  <text x="1200" y="380" text-anchor="middle" fill="#87CEEB" font-size="64" font-family="Arial, sans-serif" font-weight="bold">QUARTIER ${escapeXml(quartier)}</text>
  <line x1="200" y1="440" x2="2200" y2="440" stroke="#ffffff" stroke-width="4" opacity="0.5"/>
  <text x="1200" y="620" text-anchor="middle" fill="#ffffff" font-size="112" font-family="Arial, sans-serif" font-weight="bold">${escapeXml(avenue)}</text>
  <line x1="200" y1="700" x2="2200" y2="700" stroke="#ffffff" stroke-width="4" opacity="0.5"/>
  <text x="1000" y="1020" text-anchor="middle" fill="#ffffff" font-size="192" font-family="Arial, sans-serif" font-weight="bold">${escapeXml(numero)}</text>
  <image x="1800" y="800" width="400" height="400" href="${qrDataUrl}"/>
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
