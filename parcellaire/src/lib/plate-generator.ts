import QRCode from "qrcode";

interface PlateData {
  id: string;
  commune: string;
  quartier: string;
  avenue: string;
  numero: string;
}

export async function generatePlate(data: PlateData): Promise<{
  plaqueUrl: string;
  qrCodeUrl: string;
}> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationUrl = `${appUrl}/verification/${data.id}`;

  // Generate QR code as data URL
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 150,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });

  // Generate plate SVG
  const plateSvg = generatePlateSVG(data, qrDataUrl);

  // In production, upload to Cloudflare R2
  // For now, store as base64 data URL
  const plateDataUrl = `data:image/svg+xml;base64,${Buffer.from(plateSvg).toString("base64")}`;

  return {
    plaqueUrl: plateDataUrl,
    qrCodeUrl: qrDataUrl,
  };
}

function generatePlateSVG(data: PlateData, qrDataUrl: string): string {
  const commune = data.commune.toUpperCase();
  const quartier = data.quartier.toUpperCase();
  const avenue = data.avenue.toUpperCase();
  const numero = `N° ${data.numero}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     viewBox="0 0 600 300" width="600" height="300">
  <!-- Background plate -->
  <rect x="0" y="0" width="600" height="300" rx="12" ry="12" fill="#1a3a6b"/>
  <rect x="4" y="4" width="592" height="292" rx="10" ry="10" fill="none" stroke="#ffffff" stroke-width="2"/>
  
  <!-- DRC Flag (simplified) -->
  <g transform="translate(25, 20)">
    <!-- Sky blue background -->
    <rect width="70" height="50" fill="#007FFF" rx="3"/>
    <!-- Red diagonal stripe -->
    <polygon points="0,35 0,50 55,15 55,0 70,0 70,15 15,50 0,50" fill="#CE1021"/>
    <!-- Yellow borders of stripe -->
    <line x1="0" y1="33" x2="57" y2="0" stroke="#F7D618" stroke-width="2"/>
    <line x1="13" y1="50" x2="70" y2="17" stroke="#F7D618" stroke-width="2"/>
    <!-- Yellow star -->
    <polygon points="15,12 17,18 23,18 18,22 20,28 15,24 10,28 12,22 7,18 13,18" fill="#F7D618"/>
  </g>
  
  <!-- Official seal (circle placeholder) -->
  <g transform="translate(500, 20)">
    <circle cx="30" cy="25" r="25" fill="none" stroke="#ffffff" stroke-width="1.5"/>
    <circle cx="30" cy="25" r="20" fill="none" stroke="#ffffff" stroke-width="0.5"/>
    <text x="30" y="22" text-anchor="middle" fill="#ffffff" font-size="5" font-family="Arial">REPUBLIQUE DEMOCRATIQUE</text>
    <text x="30" y="28" text-anchor="middle" fill="#ffffff" font-size="5" font-family="Arial">DU CONGO</text>
    <!-- Shield icon -->
    <path d="M26,15 L34,15 L34,25 L30,30 L26,25 Z" fill="none" stroke="#4CAF50" stroke-width="1"/>
    <path d="M28,18 L32,18 L32,24 L30,27 L28,24 Z" fill="#4CAF50" opacity="0.6"/>
  </g>
  
  <!-- COMMUNE DE text -->
  <text x="300" y="40" text-anchor="middle" fill="#ffffff" font-size="14" font-family="Arial, sans-serif" font-weight="normal">
    COMMUNE DE
  </text>
  
  <!-- Commune name -->
  <text x="300" y="65" text-anchor="middle" fill="#ffffff" font-size="22" font-family="Arial, sans-serif" font-weight="bold">
    ${escapeXml(commune)}
  </text>
  
  <!-- Quartier -->
  <text x="300" y="100" text-anchor="middle" fill="#87CEEB" font-size="16" font-family="Arial, sans-serif" font-weight="bold">
    QUARTIER ${escapeXml(quartier)}
  </text>
  
  <!-- Separator line -->
  <line x1="50" y1="120" x2="550" y2="120" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
  
  <!-- Avenue name -->
  <text x="300" y="165" text-anchor="middle" fill="#ffffff" font-size="28" font-family="Arial, sans-serif" font-weight="bold">
    ${escapeXml(avenue)}
  </text>
  
  <!-- Separator line -->
  <line x1="50" y1="185" x2="550" y2="185" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
  
  <!-- Numero -->
  <text x="250" y="250" text-anchor="middle" fill="#ffffff" font-size="48" font-family="Arial, sans-serif" font-weight="bold">
    ${escapeXml(numero)}
  </text>
  
  <!-- QR Code -->
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
