import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import GradeBadge from "@/components/GradeBadge";
import { Grade } from "@/lib/grading";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <h1 className="text-2xl font-medium mb-1">
        {user.name ? `Hi, ${user.name}` : "Your account"}
      </h1>
      <p className="text-wire mb-8">{user.email}</p>

      <h2 className="font-display text-xs uppercase tracking-wide text-wire mb-4">
        Order history
      </h2>

      {orders.length === 0 ? (
        <p className="text-wire text-sm">No orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-ink/10 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-display text-sm">
                    Order #{order.id.slice(-8)}
                  </p>
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
                {order.items.map((item) => (
                  <div key={item.id} className="py-2 flex items-center gap-3 text-sm">
                    <span className="text-2xl">{item.product.image}</span>
                    <span className="flex-1">{item.product.name}</span>
                    <GradeBadge grade={item.product.grade as Grade} size="sm" />
                    <span className="text-wire">×{item.qty}</span>
                    <span className="font-display w-14 text-right">
                      ${item.priceAtPurchase * item.qty}
                    </span>
                  </div>
                ))}
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
