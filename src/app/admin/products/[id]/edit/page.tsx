import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditProductForm from "./EditProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <EditProductForm
      product={{
        id: product.id,
        name: product.name,
        category: product.category,
        brand: product.brand ?? "",
        price: product.price,
        originalPrice: product.originalPrice,
        grade: product.grade,
        battery: product.battery,
        warrantyDays: product.warrantyDays,
        specs: product.specs.join(", "),
        gradeNotes: product.gradeNotes,
        imageUrl: product.imageUrl,
        image: product.image,
        inStock: product.inStock,
      }}
    />
  );
}
