import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentUser } from "@/lib/auth";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_VIDEO_BYTES = 60 * 1024 * 1024; // 60MB — short testimonial clips only

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
  const folder = (form.get("folder") as string | null) || "products";
  const safeFolder = /^[a-z0-9-]+$/.test(folder) ? folder : "products";

  // Accept one or many files under the "file" field.
  const files = form.getAll("file").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const urls: string[] = [];
  for (const file of files) {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: "Please upload an image or video file." }, { status: 400 });
    }
    const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > limit) {
      return NextResponse.json(
        { error: isVideo ? "Video must be under 60MB." : "Each image must be under 8MB." },
        { status: 400 }
      );
    }
    const blob = await put(`${safeFolder}/${Date.now()}-${file.name}`, file, {
      access: "public",
    });
    urls.push(blob.url);
  }

  // Return both a single url (first) and the full list for multi-photo use.
  return NextResponse.json({ url: urls[0], urls });
}
