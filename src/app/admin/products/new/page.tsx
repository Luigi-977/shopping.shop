import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import NewProductForm from "./NewProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");
  return <NewProductForm />;
}
