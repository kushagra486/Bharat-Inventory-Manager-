import type { Metadata } from "next";
import { Manrope, DM_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Bharat Store — shop local, delivered fast",
  description: "Browse real stock from nearby shops and order for fast delivery.",
};

export default function ShopLayout({ children }: LayoutProps<"/shop">) {
  return (
    <div className={`${manrope.variable} ${dmMono.variable} storefront-theme min-h-screen bg-background`}>
      {children}
      <Toaster />
    </div>
  );
}
