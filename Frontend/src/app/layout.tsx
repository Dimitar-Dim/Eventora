import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navigation from "@/components/navigation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Eventoria - Live Music Events",
  description: "Discover and book amazing live music events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-slate-900 text-white">
          <Navigation />
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
