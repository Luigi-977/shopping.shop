import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { CurrencyProvider } from "@/lib/currency-context";
import Header from "@/components/Header";
import BackNav from "@/components/BackNav";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import CareChat from "@/components/CareChat";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Reboot Market — Graded second-hand electronics",
  description:
    "Phones, laptops, cameras and more, every one graded A–C and warrantied. Buy or sell used electronics with a condition you can trust.",
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
              <BackNav />
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
