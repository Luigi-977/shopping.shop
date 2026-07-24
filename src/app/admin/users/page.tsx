import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (me.role !== "admin") redirect("/");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="text-2xl font-medium mb-1">Customers</h1>
      <p className="text-wire mb-8">{users.length} registered accounts</p>

      <div className="space-y-2">
        {users.map((u) => (
          <div
            key={u.id}
            className="flex items-center gap-3 border border-ink/10 rounded-lg p-3"
          >
            <div className="w-10 h-10 rounded-full bg-circuit-soft text-circuit flex items-center justify-center font-display font-bold shrink-0">
              {(u.name || u.email)[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{u.name || u.email.split("@")[0]}</p>
              <p className="text-xs text-wire truncate">{u.email}</p>
            </div>
            <div className="text-right shrink-0">
              {u.role === "admin" && (
                <span className="text-xs font-display uppercase bg-ink text-paper px-2 py-0.5 rounded mr-1">
                  admin
                </span>
              )}
              <span className="text-xs text-wire">
                {u._count.orders} order{u._count.orders === 1 ? "" : "s"}
              </span>
              <p className="text-xs text-wire mt-0.5">
                {new Date(u.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
