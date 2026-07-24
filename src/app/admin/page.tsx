import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");

  const [orders, productCount, userCount, pendingListings] = await Promise.all([
    prisma.order.findMany({
      include: { items: { include: { product: true } }, user: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.product.count({ where: { inStock: true } }),
    prisma.user.count(),
    prisma.listingSubmission.count({ where: { status: "pending_review" } }),
  ]);

  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ordersToday = orders.filter((o) => o.createdAt >= today);
  const revenueToday = ordersToday.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <h1 className="text-2xl font-medium mb-1">Till</h1>
      <p className="text-wire mb-8">Every order, as it comes in.</p>

      <a
        href="/admin/products/new"
        className="inline-block mb-8 bg-ink text-paper font-display text-sm px-4 py-2.5 rounded-md hover:bg-ink-soft transition-colors"
      >
        + Add a product
      </a>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="border border-ink/10 rounded-lg p-4">
          <p className="text-xs font-display uppercase text-wire mb-1">Revenue today</p>
          <p className="font-display font-bold text-2xl">${revenueToday}</p>
        </div>
        <div className="border border-ink/10 rounded-lg p-4">
          <p className="text-xs font-display uppercase text-wire mb-1">Orders today</p>
          <p className="font-display font-bold text-2xl">{ordersToday.length}</p>
        </div>
        <div className="border border-ink/10 rounded-lg p-4">
          <p className="text-xs font-display uppercase text-wire mb-1">All-time revenue</p>
          <p className="font-display font-bold text-2xl">${revenue}</p>
        </div>
        <div className="border border-ink/10 rounded-lg p-4">
          <p className="text-xs font-display uppercase text-wire mb-1">Customers</p>
          <p className="font-display font-bold text-2xl">{userCount}</p>
        </div>
      </div>

      {pendingListings > 0 && (
        <p className="text-sm text-circuit mb-6">
          {pendingListings} device{pendingListings > 1 ? "s" : ""} waiting for review in Sell submissions.
        </p>
      )}

      <p className="text-sm text-wire mb-6">
        {productCount} products live in the shop.
      </p>

      <h2 className="font-display text-xs uppercase tracking-wide text-wire mb-4">
        Orders
      </h2>

      {orders.length === 0 ? (
        <p className="text-wire text-sm">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <details
              key={order.id}
              className="border border-ink/10 rounded-lg p-4 group"
            >
              <summary className="flex items-center justify-between gap-3 cursor-pointer list-none">
                <div className="min-w-0">
                  <p className="font-medium truncate">{order.email}</p>
                  <p className="text-xs text-wire">
                    {new Date(order.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {" · "}
                    {order.items.length} item{order.items.length > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-display uppercase bg-circuit-soft text-circuit px-2 py-1 rounded">
                    {order.status}
                  </span>
                  <span className="font-display font-bold">${order.total}</span>
                </div>
              </summary>
              <div className="mt-4 pt-4 border-t border-ink/10 divide-y divide-ink/10 text-sm">
                {order.items.map((item) => (
                  <div key={item.id} className="py-1.5 flex items-center gap-2">
                    <span>{item.product.image}</span>
                    <span className="flex-1">{item.product.name}</span>
                    <span className="text-wire">×{item.qty}</span>
                    <span className="font-display w-14 text-right">
                      ${item.priceAtPurchase * item.qty}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
