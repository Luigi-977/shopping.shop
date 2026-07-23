import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { name, category, grade, askingPrice, email } = await req.json();

  if (!name || !category || !grade || !askingPrice || !email) {
    return NextResponse.json({ error: "Please fill in every field." }, { status: 400 });
  }

  const submission = await prisma.listingSubmission.create({
    data: { name, category, grade, askingPrice: Number(askingPrice), email },
  });

  return NextResponse.json({ submission }, { status: 201 });
}
