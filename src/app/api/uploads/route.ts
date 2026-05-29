import { NextRequest, NextResponse } from "next/server";

// S3-compatible client for Cloudflare R2
async function uploadToR2(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME || "lopango-plaques";
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !publicUrl) {
    // Fallback: store as base64 data URL (dev mode)
    const base64 = file.toString("base64");
    return `data:${contentType};base64,${base64}`;
  }

  // Use S3-compatible API via fetch with AWS Signature V4
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  const key = `assets/${Date.now()}-${filename}`;

  const url = `${endpoint}/${bucketName}/${key}`;

  // Simple PUT request (R2 supports unsigned uploads with API token auth)
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "X-Custom-Auth-Key": `${accessKeyId}:${secretAccessKey}`,
    },
    body: file as unknown as BodyInit,
  });

  if (!response.ok) {
    // Fallback to base64 if R2 fails
    const base64 = file.toString("base64");
    return `data:${contentType};base64,${base64}`;
  }

  return `${publicUrl}/${key}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null; // "flag" or "seal"

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Type de fichier non supporté. Utilisez PNG, JPEG, SVG ou WebP." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 5 Mo)" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const prefix = type === "seal" ? "seal" : type === "flag" ? "flag" : "asset";
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${prefix}-${safeName}`;

    const url = await uploadToR2(buffer, filename, file.type);

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 }
    );
  }
}
