import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminChatClient from "./AdminChatClient";

export const dynamic = "force-dynamic";

export default async function AdminChatPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");
  return <AdminChatClient />;
}
