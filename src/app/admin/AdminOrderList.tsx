"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Item = { id: string; name: string; image: string; qty: number; lineTotal: number };
type Order = {
  id: string;
  email: string;
  deliveryCountry?: string | null;
  deliveryRegion?: string | null;
  deliveryTown?: string | null;
  deliveryLandmark?: string | null;
  deliveryPhone?: string | null;
  status: string;
  total: number;
  createdAt: string;
  items: Item[];
};

export default function AdminOrderList({ orders: initial }: { orders: Order[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function cancel(id: string) {
    setBusy(id);
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status: "cancelled" } : x)));
    setBusy(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this order permanently? This cannot be undone.")) return;
    setBusy(id);
    await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
    setOrders((o) => o.filter((x) => x.id !== id));
    setBusy(null);
    router.refresh();
  }

  async function markShipped(id: string) {
    setBusy(id);
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "shipped" }),
    });
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status: "shipped" } : x)));
    setBusy(null);
    router.refresh();
  }

  const statusColor: Record<string, string> = {
    paid: "bg-circuit-soft text-circuit",
    pending: "bg-signal/20 text-ink",
    shipped: "bg-ink text-paper",
    cancelled: "bg-rust/15 text-rust",
  };

  if (orders.length === 0) {
    return <p className="text-wire text-sm">No orders yet.</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="border border-ink/10 rounded-lg p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
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
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-xs font-display uppercase px-2 py-1 rounded ${
                  statusColor[order.status] ?? "bg-ink/10 text-ink"
                }`}
              >
                {order.status}
              </span>
              <span className="font-display font-bold">${order.total}</span>
            </div>
          </div>

          <div className="divide-y divide-ink/10 text-sm mb-3">
            {order.items.map((item) => (
              <div key={item.id} className="py-1.5 flex items-center gap-2">
                <span>{item.image}</span>
                <span className="flex-1 truncate">{item.name}</span>
                <span className="text-wire">×{item.qty}</span>
                <span className="font-display w-14 text-right">${item.lineTotal}</span>
              </div>
            ))}
          </div>

          {(order.deliveryTown || order.deliveryPhone) && (
            <div className="mb-3 text-xs bg-signal/10 border border-signal/30 rounded-md p-2.5">
              <p className="font-display font-bold uppercase text-[10px] text-wire mb-1">Deliver to</p>
              <p>
                {[order.deliveryTown, order.deliveryRegion, order.deliveryCountry]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {order.deliveryLandmark && (
                <p className="text-wire">Landmark: {order.deliveryLandmark}</p>
              )}
              {order.deliveryPhone && (
                <p className="text-wire">Phone: {order.deliveryPhone}</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {order.status === "paid" && (
              <button
                onClick={() => markShipped(order.id)}
                disabled={busy === order.id}
                className="text-xs font-display px-3 py-1.5 rounded-md bg-ink text-paper hover:bg-ink-soft disabled:opacity-50"
              >
                Mark shipped
              </button>
            )}
            {order.status !== "cancelled" && (
              <button
                onClick={() => cancel(order.id)}
                disabled={busy === order.id}
                className="text-xs font-display px-3 py-1.5 rounded-md border border-ink/20 hover:border-ink disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              onClick={() => remove(order.id)}
              disabled={busy === order.id}
              className="text-xs font-display px-3 py-1.5 rounded-md text-rust border border-rust/30 hover:bg-rust hover:text-paper disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
