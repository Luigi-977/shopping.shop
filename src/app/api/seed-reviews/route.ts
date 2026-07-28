import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// The reviews to seed, each tied to a product slug.
const REVIEWS: {
  slug: string;
  authorName: string;
  rating: number;
  body: string;
}[] = [
  {
    slug: "iphone-13-blue",
    authorName: "James M.",
    rating: 5,
    body: "Ordered an iPhone 13 on Monday and received it in Nairobi the following day. Battery health was 89% exactly as listed, and honestly it looks almost brand new. Very happy with my purchase.",
  },
  {
    slug: "samsung-galaxy-s22",
    authorName: "Faith N.",
    rating: 5,
    body: "Bought a Samsung Galaxy S22 Grade A. I kept expecting to find scratches but I honestly couldn't see any. Saved a lot compared to buying a new one.",
  },
  {
    slug: "macbook-air-m1",
    authorName: "Kevin O.",
    rating: 4,
    body: "Got a MacBook Air M1. Everything works perfectly and the battery lasts the whole day. Delivery came a day later than expected but customer service kept me updated.",
  },
  {
    slug: "iphone-14",
    authorName: "Anonymous",
    rating: 5,
    body: "I was honestly scared of buying a refurbished phone online, but this was worth it. My iPhone 14 arrived sealed properly, clean, and exactly as described.",
  },
  {
    slug: "samsung-65-crystal-uhd",
    authorName: "Mary W.",
    rating: 5,
    body: "Purchased a 55-inch Samsung Smart TV. Picture quality is excellent and you honestly can't tell it's refurbished. Packaging was secure too.",
  },
  {
    slug: "dell-latitude-7420",
    authorName: "Brian K.",
    rating: 4,
    body: "Bought a Dell Latitude for work. There was one tiny mark on the corner just like the Grade B description said. Runs fast and battery is still very good.",
  },
  {
    slug: "google-pixel-8",
    authorName: "Esther C.",
    rating: 5,
    body: "The warranty gave me confidence to order. Thankfully I haven't needed it because the Google Pixel 8 works perfectly. Would definitely buy here again.",
  },
  {
    slug: "hp-elitebook-840",
    authorName: "Hassan A.",
    rating: 5,
    body: "Received my HP EliteBook in Mombasa after two days. Clean keyboard, screen in excellent condition, and everything works straight out of the box.",
  },
  {
    slug: "iphone-12",
    authorName: "Lucy M.",
    rating: 5,
    body: "Bought an iPhone 12 for my daughter. Battery health was 90% just like the listing. She loves it and it was much cheaper than buying new.",
  },
  {
    slug: "samsung-galaxy-s23",
    authorName: "Daniel G.",
    rating: 3,
    body: "The phone itself is excellent and matches the Grade A description. Only issue was delivery took an extra day because of the courier. Otherwise no complaints.",
  },
  {
    slug: "lenovo-thinkpad-x1",
    authorName: "Sharon N.",
    rating: 5,
    body: "Got a Lenovo ThinkPad for university. Fast, clean and exactly what I needed. Great value considering the condition.",
  },
  {
    slug: "playstation-5",
    authorName: "Eric T.",
    rating: 4,
    body: "Ordered a PlayStation 5. Everything works perfectly and it came well packed. Controller had a few light marks but nothing serious.",
  },
  {
    slug: "samsung-galaxy-s23",
    authorName: "Joseph M.",
    rating: 5,
    body: "I compared prices everywhere before buying this Samsung Galaxy S23. Happy I chose this store because the phone looks almost unused and saved me a lot of money.",
  },
  {
    slug: "lg-c3-55-oled",
    authorName: "Grace W.",
    rating: 5,
    body: "Bought an LG Smart TV for our sitting room. Easy setup, clear picture and no issues at all. Family is very happy with it.",
  },
  {
    slug: "iphone-15",
    authorName: "Peter O.",
    rating: 5,
    body: "This was my first refurbished purchase. Ordered an iPhone 15 and I genuinely can't tell it's not new. Battery health was exactly as advertised and customer support answered all my questions before I ordered.",
  },
];

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const expected = process.env.SEED_SECRET;

  if (!expected) {
    return NextResponse.json(
      { error: "SEED_SECRET is not set on the server." },
      { status: 500 }
    );
  }
  if (key !== expected) {
    return NextResponse.json({ error: "Invalid key." }, { status: 401 });
  }

  let added = 0;
  const missing: string[] = [];

  for (const r of REVIEWS) {
    const product = await prisma.product.findUnique({ where: { slug: r.slug } });
    if (!product) {
      missing.push(r.slug);
      continue;
    }
    // Avoid duplicates if run more than once: skip if same author+product exists.
    const exists = await prisma.review.findFirst({
      where: { productId: product.id, authorName: r.authorName },
    });
    if (exists) continue;

    await prisma.review.create({
      data: {
        productId: product.id,
        authorName: r.authorName,
        rating: r.rating,
        body: r.body,
      },
    });
    added++;
  }

  return NextResponse.json({ ok: true, added, missing });
}
