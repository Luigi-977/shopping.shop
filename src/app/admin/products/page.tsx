import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminProductList from "./AdminProductList";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");

  const products = await prisma.product.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const list = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    brand: p.brand,
    grade: p.grade,
    price: p.price,
    image: p.image,
    imageUrl: (p.imageUrls && p.imageUrls[0]) || p.imageUrl,
    hasPhoto: Boolean(p.imageUrl || (p.imageUrls && p.imageUrls.length > 0)),
  }));

  return <AdminProductList products={list} />;
}
