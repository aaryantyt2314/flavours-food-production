import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flavours Food — Unlimited Choice Under One Roof",
  description: "Muradnagar's favorite restaurant with 200+ dishes across 13 categories. From tandoori to pizza, momos to mocktails — crafted with love, served with a smile.",
  keywords: ["Flavours Food", "Muradnagar restaurant", "tandoori", "pizza", "momos", "Indian food", "restaurant near me"],
  authors: [{ name: "Flavours Food" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Flavours Food — Happiness is Flavours",
    description: "200+ dishes, 13 categories. Unlimited choice under one roof.",
    siteName: "Flavours Food",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} antialiased bg-background text-foreground`}
      >
        <Providers session={session}>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
