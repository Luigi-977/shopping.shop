import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import GradeBadge from "@/components/GradeBadge";
import { Grade } from "@/lib/grading";
import AccountClient from "./AccountClient";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totalSpent = orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + o.total, 0);
  const paidCount = orders.filter((o) => o.status === "paid").length;

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      {/* Header + editable profile */}
      <AccountClient
        initialName={user.name}
        email={user.email}
        isAdmin={user.role === "admin"}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 my-8">
        <div className="border border-ink/10 rounded-lg p-4 text-center">
          <p className="font-display font-bold text-2xl">{orders.length}</p>
          <p className="text-xs text-wire">orders</p>
        </div>
        <div className="border border-ink/10 rounded-lg p-4 text-center">
          <p className="font-display font-bold text-2xl">{paidCount}</p>
          <p className="text-xs text-wire">completed</p>
        </div>
        <div className="border border-ink/10 rounded-lg p-4 text-center">
          <p className="font-display font-bold text-2xl">${totalSpent}</p>
          <p className="text-xs text-wire">total spent</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <Link href="/shop" className="border border-ink/10 rounded-lg p-4 text-center hover:border-ink/30 transition-colors">
          <p className="text-2xl mb-1">🛍️</p>
          <p className="text-sm font-medium">Shop</p>
        </Link>
        <Link href="/sell" className="border border-ink/10 rounded-lg p-4 text-center hover:border-ink/30 transition-colors">
          <p className="text-2xl mb-1">💸</p>
          <p className="text-sm font-medium">Sell a device</p>
        </Link>
        <Link href="/contact" className="border border-ink/10 rounded-lg p-4 text-center hover:border-ink/30 transition-colors">
          <p className="text-2xl mb-1">📍</p>
          <p className="text-sm font-medium">Contact</p>
        </Link>
        <Link href="/policies" className="border border-ink/10 rounded-lg p-4 text-center hover:border-ink/30 transition-colors">
          <p className="text-2xl mb-1">📋</p>
          <p className="text-sm font-medium">Policies</p>
        </Link>
      </div>

      {/* Orders */}
      <h2 className="font-display text-xs uppercase tracking-wide text-wire mb-4">
        Order history
      </h2>

      {orders.length === 0 ? (
        <div className="border border-ink/10 rounded-lg p-8 text-center">
          <p className="text-wire text-sm mb-4">You haven&rsquo;t placed any orders yet.</p>
          <Link href="/shop" className="inline-block bg-ink text-paper font-display text-sm px-5 py-3 rounded-md">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-ink/10 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-display text-sm">Order #{order.id.slice(-8)}</p>
                  <p className="text-xs text-wire">
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span className="text-xs font-display uppercase bg-circuit-soft text-circuit px-2 py-1 rounded">
                  {order.status}
                </span>
              </div>
              <div className="divide-y divide-ink/10">
                {order.items.map((item) => {
                  const photo =
                    (item.product.imageUrls && item.product.imageUrls[0]) ||
                    item.product.imageUrl;
                  return (
                    <div key={item.id} className="py-2 flex items-center gap-3 text-sm">
                      <span className="w-8 h-8 rounded overflow-hidden flex items-center justify-center shrink-0 bg-ink/[0.04] text-xl">
                        {photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photo} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          item.product.image
                        )}
                      </span>
                      <span className="flex-1">{item.product.name}</span>
                      <GradeBadge grade={item.product.grade as Grade} size="sm" />
                      <span className="text-wire">×{item.qty}</span>
                      <span className="font-display w-14 text-right">
                        ${item.priceAtPurchase * item.qty}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="text-right mt-3 font-display font-bold">
                Total: ${order.total}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
