import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Suspense } from "react"
import Navigation from "@/components/navigation"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Eventora",
  description: "Discover and create unforgettable music experiences",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} font-sans antialiased`}>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main>
            <Suspense fallback={null}>{children}</Suspense>
          </main>
        </div>
      </body>
    </html>
  )
}
