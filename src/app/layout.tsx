import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { CurrencyProvider } from "@/lib/currency-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import CareChat from "@/components/CareChat";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shopping-shop-ashy.vercel.app"),
  title: {
    default: "Reboot Market — Refurbished Phones, Laptops & Electronics in Kenya",
    template: "%s | Reboot Market",
  },
  description:
    "Buy graded, warrantied refurbished iPhones, Samsung, laptops, TVs and more. Every device inspected, graded A–C, and covered by warranty. Card & M-Pesa accepted.",
  keywords: [
    "refurbished phones Kenya",
    "second hand phones Nairobi",
    "used iPhone Kenya",
    "refurbished Samsung Kenya",
    "cheap laptops Kenya",
    "refurbished electronics",
    "buy phones Kenya M-Pesa",
    "graded phones Kenya",
  ],
  openGraph: {
    title: "Reboot Market — Refurbished Electronics You Can Trust",
    description:
      "Graded, warrantied refurbished phones, laptops and electronics. Card & M-Pesa accepted, delivery across Kenya.",
    type: "website",
    locale: "en_KE",
    siteName: "Reboot Market",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reboot Market — Refurbished Electronics You Can Trust",
    description:
      "Graded, warrantied refurbished phones, laptops and electronics. Card & M-Pesa accepted.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} antialiased`}>
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <Header />
              <main>{children}</main>
              <Footer />
              <FloatingWhatsApp />
              <CareChat />
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
