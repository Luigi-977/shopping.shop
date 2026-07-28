import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminReviewsClient from "./AdminReviewsClient";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");

  const [products, reviews] = await Promise.all([
    prisma.product.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.review.findMany({
      include: { product: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  return (
    <AdminReviewsClient
      products={products}
      initialReviews={reviews.map((r) => ({
        id: r.id,
        productId: r.productId,
        productName: r.product.name,
        authorName: r.authorName,
        authorLocation: r.authorLocation,
        rating: r.rating,
        body: r.body,
        photoUrl: r.photoUrl,
        videoUrl: r.videoUrl,
        createdAt: r.createdAt.toISOString(),
      }))}
    />
  );
}