import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "یدکی | فروشگاه اینترنتی لوازم یدکی خودرو",
    template: "%s | یدکی",
  },
  description:
    "خرید آنلاین لوازم یدکی خودرو با تضمین اصالت کالا، قیمت همکار برای تعمیرگاه‌ها، جستجو بر اساس کد فنی و شماره قطعه و سازگاری دقیق با خودروی شما.",
  keywords: ["لوازم یدکی", "قطعات خودرو", "فروشگاه یدکی", "لوازم یدکی ایرانی", "قطعه اصلی"],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "یدکی",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
