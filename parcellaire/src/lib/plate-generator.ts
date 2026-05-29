import QRCode from "qrcode";
import type { VariantDesign } from "@/db/schema";

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


// New function with template support
export async function generatePlateWithTemplate(
  data: PlateData,
  templateConfig?: TemplateConfig
): Promise<{
  plaqueUrl: string;
  qrCodeUrl: string;
}> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationUrl = `${appUrl}/verification/${data.id}`;

  // Generate QR code as data URL
  // Use higher error correction (H) when seal is embedded in center
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 200,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
    errorCorrectionLevel: templateConfig?.sealUrl ? "H" : "M",
  });

  // Generate plate SVG
  const plateSvg = templateConfig
    ? generateTemplatePlateSVG(data, qrDataUrl, templateConfig)
    : generateDefaultPlateSVG(data, qrDataUrl);

  const plateDataUrl = `data:image/svg+xml;base64,${Buffer.from(plateSvg).toString("base64")}`;

  // Generate QR with seal overlay for display
  const qrWithSeal = templateConfig?.sealUrl
    ? generateQRWithSealSVG(qrDataUrl, templateConfig.sealUrl)
    : qrDataUrl;

  const finalQrUrl = typeof qrWithSeal === "string" && qrWithSeal.startsWith("data:image/svg")
    ? qrWithSeal
    : qrDataUrl;

  return {
    plaqueUrl: plateDataUrl,
    qrCodeUrl: finalQrUrl,
  };
}


// Generate QR code SVG with seal in center
function generateQRWithSealSVG(qrDataUrl: string, sealUrl: string): string {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 200 200" width="200" height="200">
  <image x="0" y="0" width="200" height="200" href="${qrDataUrl}"/>
  <!-- White circle background for seal -->
  <circle cx="100" cy="100" r="28" fill="white"/>
  <!-- Seal image clipped to circle -->
  <clipPath id="sealCenter">
    <circle cx="100" cy="100" r="25"/>
  </clipPath>
  <image x="75" y="75" width="50" height="50" href="${escapeXml(sealUrl)}" clipPath="url(#sealCenter)" preserveAspectRatio="xMidYMid slice"/>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// Template-based plate SVG
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
  const rx = variant.shape === "rectangle" ? "4" : variant.shape === "rounded" ? "12" : "20";
  const innerRx = String(Math.max(0, Number(rx) - 2));

  // Build QR with seal in center if seal available
  const qrSvgContent = sealUrl
    ? `<image x="450" y="195" width="110" height="110" href="${qrDataUrl}"/>
       <circle cx="505" cy="250" r="18" fill="white"/>
       <clipPath id="qrSeal"><circle cx="505" cy="250" r="15"/></clipPath>
       <image x="490" y="235" width="30" height="30" href="${escapeXml(sealUrl)}" clip-path="url(#qrSeal)" preserveAspectRatio="xMidYMid slice"/>`
    : `<image x="450" y="200" width="100" height="100" href="${qrDataUrl}"/>`;

  const flagContent = flagUrl
    ? `<image x="25" y="20" width="70" height="50" href="${escapeXml(flagUrl)}" preserveAspectRatio="xMidYMid meet"/>`
    : `<g transform="translate(25, 20)">
        <rect width="70" height="50" fill="#007FFF" rx="3"/>
        <polygon points="0,35 0,50 55,15 55,0 70,0 70,15 15,50 0,50" fill="#CE1021"/>
        <line x1="0" y1="33" x2="57" y2="0" stroke="#F7D618" stroke-width="2"/>
        <line x1="13" y1="50" x2="70" y2="17" stroke="#F7D618" stroke-width="2"/>
        <polygon points="15,12 17,18 23,18 18,22 20,28 15,24 10,28 12,22 7,18 13,18" fill="#F7D618"/>
      </g>`;

  const sealContent = sealUrl
    ? `<clipPath id="plateSeal"><circle cx="555" cy="45" r="25"/></clipPath>
       <image x="530" y="20" width="50" height="50" href="${escapeXml(sealUrl)}" clip-path="url(#plateSeal)" preserveAspectRatio="xMidYMid slice"/>`
    : `<g transform="translate(525, 20)">
        <circle cx="30" cy="25" r="25" fill="none" stroke="${escapeXml(variant.borderColor)}" stroke-width="1.5"/>
        <circle cx="30" cy="25" r="20" fill="none" stroke="${escapeXml(variant.borderColor)}" stroke-width="0.5"/>
      </g>`;


  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 600 300" width="600" height="300">
  <!-- Background plate -->
  <rect x="0" y="0" width="600" height="300" rx="${rx}" ry="${rx}" fill="${escapeXml(variant.borderColor)}"/>
  <rect x="4" y="4" width="592" height="292" rx="${innerRx}" ry="${innerRx}" fill="${escapeXml(variant.bgColor)}"/>
  
  <!-- Flag -->
  ${flagContent}
  
  <!-- Seal (always round) -->
  ${sealContent}
  
  <!-- COMMUNE DE text -->
  <text x="300" y="40" text-anchor="middle" fill="${escapeXml(variant.accentColor)}" font-size="14" font-family="${escapeXml(variant.fontFamily)}" font-weight="normal">
    COMMUNE DE
  </text>
  
  <!-- Commune name -->
  <text x="300" y="65" text-anchor="middle" fill="${escapeXml(variant.textColor)}" font-size="22" font-family="${escapeXml(variant.fontFamily)}" font-weight="bold">
    ${escapeXml(commune)}
  </text>
  
  <!-- Quartier -->
  <text x="300" y="100" text-anchor="middle" fill="${escapeXml(variant.accentColor)}" font-size="16" font-family="${escapeXml(variant.fontFamily)}" font-weight="bold">
    QUARTIER ${escapeXml(quartier)}
  </text>
  
  <!-- Separator line -->
  <line x1="50" y1="120" x2="550" y2="120" stroke="${escapeXml(variant.borderColor)}" stroke-width="1" opacity="0.5"/>
  
  <!-- Avenue name -->
  <text x="300" y="165" text-anchor="middle" fill="${escapeXml(variant.textColor)}" font-size="28" font-family="${escapeXml(variant.fontFamily)}" font-weight="bold">
    ${escapeXml(avenue)}
  </text>
  
  <!-- Separator line -->
  <line x1="50" y1="185" x2="550" y2="185" stroke="${escapeXml(variant.borderColor)}" stroke-width="1" opacity="0.5"/>
  
  <!-- Numero -->
  <text x="250" y="255" text-anchor="middle" fill="${escapeXml(variant.textColor)}" font-size="48" font-family="${escapeXml(variant.fontFamily)}" font-weight="bold">
    ${escapeXml(numero)}
  </text>
  
  <!-- QR Code with seal in center -->
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
     viewBox="0 0 600 300" width="600" height="300">
  <rect x="0" y="0" width="600" height="300" rx="12" ry="12" fill="#1a3a6b"/>
  <rect x="4" y="4" width="592" height="292" rx="10" ry="10" fill="none" stroke="#ffffff" stroke-width="2"/>
  <g transform="translate(25, 20)">
    <rect width="70" height="50" fill="#007FFF" rx="3"/>
    <polygon points="0,35 0,50 55,15 55,0 70,0 70,15 15,50 0,50" fill="#CE1021"/>
    <line x1="0" y1="33" x2="57" y2="0" stroke="#F7D618" stroke-width="2"/>
    <line x1="13" y1="50" x2="70" y2="17" stroke="#F7D618" stroke-width="2"/>
    <polygon points="15,12 17,18 23,18 18,22 20,28 15,24 10,28 12,22 7,18 13,18" fill="#F7D618"/>
  </g>
  <g transform="translate(500, 20)">
    <circle cx="30" cy="25" r="25" fill="none" stroke="#ffffff" stroke-width="1.5"/>
    <circle cx="30" cy="25" r="20" fill="none" stroke="#ffffff" stroke-width="0.5"/>
  </g>
  <text x="300" y="40" text-anchor="middle" fill="#ffffff" font-size="14" font-family="Arial, sans-serif">COMMUNE DE</text>
  <text x="300" y="65" text-anchor="middle" fill="#ffffff" font-size="22" font-family="Arial, sans-serif" font-weight="bold">${escapeXml(commune)}</text>
  <text x="300" y="100" text-anchor="middle" fill="#87CEEB" font-size="16" font-family="Arial, sans-serif" font-weight="bold">QUARTIER ${escapeXml(quartier)}</text>
  <line x1="50" y1="120" x2="550" y2="120" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
  <text x="300" y="165" text-anchor="middle" fill="#ffffff" font-size="28" font-family="Arial, sans-serif" font-weight="bold">${escapeXml(avenue)}</text>
  <line x1="50" y1="185" x2="550" y2="185" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
  <text x="250" y="255" text-anchor="middle" fill="#ffffff" font-size="48" font-family="Arial, sans-serif" font-weight="bold">${escapeXml(numero)}</text>
  <image x="450" y="200" width="100" height="100" href="${qrDataUrl}"/>
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
