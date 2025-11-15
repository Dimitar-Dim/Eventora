import Link from "next/link"
import { ReactNode } from "react"

interface PageHeaderProps {
  title: string | ReactNode
  subtitle: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold mb-2">
        <span className="gradient-text">{title}</span>
      </h1>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  )
}

interface TermsFooterProps {
  agreement: string
}

export function TermsFooter({ agreement }: TermsFooterProps) {
  return (
    <div className="text-center text-xs text-muted-foreground">
      <p>
        {agreement}{" "}
        <Link href="#" className="text-primary hover:text-accent transition-colors">
          Terms of Service
        </Link>
        {" "}and{" "}
        <Link href="#" className="text-primary hover:text-accent transition-colors">
          Privacy Policy
        </Link>
      </p>
    </div>
  )
}
