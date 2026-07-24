import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Photo storage is not set up yet. Add a Blob store in Vercel." },
      { status: 500 }
    );
  }

  const form = await req.formData();
  // Accept one or many files under the "file" field.
  const files = form.getAll("file").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const urls: string[] = [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Please upload images only." }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Each image must be under 8MB." }, { status: 400 });
    }
    const blob = await put(`products/${Date.now()}-${file.name}`, file, {
      access: "public",
    });
    urls.push(blob.url);
  }

  // Return both a single url (first) and the full list for multi-photo use.
  return NextResponse.json({ url: urls[0], urls });
}
