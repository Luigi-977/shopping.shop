import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");

  const products = await prisma.product.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const withPhoto = products.filter((p) => p.imageUrl).length;

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-1 gap-4">
        <h1 className="text-2xl font-medium">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-ink text-paper font-display text-sm px-4 py-2.5 rounded-md hover:bg-ink-soft transition-colors shrink-0"
        >
          + Add
        </Link>
      </div>
      <p className="text-wire mb-8">
        {products.length} products · {withPhoto} with real photos
      </p>

      <div className="space-y-2">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/admin/products/${p.id}/edit`}
            className="flex items-center gap-3 border border-ink/10 rounded-lg p-3 hover:border-ink/30 transition-colors"
          >
            <div className="w-14 h-14 rounded-md bg-ink/[0.04] flex items-center justify-center text-2xl overflow-hidden shrink-0">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                p.image
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{p.name}</p>
              <p className="text-xs text-wire">
                {p.category}
                {p.brand ? ` · ${p.brand}` : ""} · Grade {p.grade} · ${p.price}
              </p>
            </div>
            {!p.imageUrl && (
              <span className="text-xs font-display text-rust border border-rust/40 rounded px-2 py-0.5 shrink-0">
                No photo
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
