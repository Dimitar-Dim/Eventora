import Link from "next/link"
import { ReactNode } from "react"

interface FormCardProps {
  children: ReactNode
  footerText: string
  footerLink: { text: string; href: string }
}

export function FormCard({ children, footerText, footerLink }: FormCardProps) {
  return (
    <div className="border border-border bg-card/50 backdrop-blur-sm rounded-lg p-8 mb-6">
      {children}

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/30"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card/50 px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      {/* Link */}
      <p className="text-center text-sm text-muted-foreground">
        {footerText}{" "}
        <Link
          href={footerLink.href}
          className="text-primary hover:text-accent font-semibold transition-colors"
        >
          {footerLink.text}
        </Link>
      </p>
    </div>
  )
}
