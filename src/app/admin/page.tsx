import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminOrderList from "./AdminOrderList";

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

      <div className="flex flex-wrap gap-2 mb-8">
        <a
          href="/admin/products"
          className="bg-ink text-paper font-display text-sm px-4 py-2.5 rounded-md hover:bg-ink-soft transition-colors"
        >
          Manage products
        </a>
        <a
          href="/admin/products/new"
          className="border border-ink font-display text-sm px-4 py-2.5 rounded-md hover:bg-ink hover:text-paper transition-colors"
        >
          + Add a product
        </a>
        <a
          href="/admin/users"
          className="border border-ink font-display text-sm px-4 py-2.5 rounded-md hover:bg-ink hover:text-paper transition-colors"
        >
          Customers
        </a>
        <a
          href="/admin/chat"
          className="border border-ink font-display text-sm px-4 py-2.5 rounded-md hover:bg-ink hover:text-paper transition-colors"
        >
          Customer care
        </a>
      </div>

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

      <AdminOrderList
        orders={orders.map((order) => ({
          id: order.id,
          email: order.email,
          status: order.status,
          total: order.total,
          createdAt: order.createdAt.toISOString(),
          items: order.items.map((item) => ({
            id: item.id,
            name: item.product.name,
            image: item.product.image,
            qty: item.qty,
            lineTotal: item.priceAtPurchase * item.qty,
          })),
        }))}
      />
    </div>
  );
}
