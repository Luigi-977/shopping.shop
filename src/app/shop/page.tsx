import type { Metadata } from "next";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop — Reboot Market",
};

export default function ShopPage() {
  return <ShopClient />;
}
