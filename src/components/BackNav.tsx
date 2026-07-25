"use client";

import { usePathname } from "next/navigation";
import BackButton from "./BackButton";

export default function BackNav() {
  const pathname = usePathname();

  // No back button on the home page — there's nowhere useful to go back to.
  if (pathname === "/") return null;

  return (
    <div className="max-w-6xl mx-auto px-5 pt-3 -mb-2">
      <BackButton />
    </div>
  );
}
