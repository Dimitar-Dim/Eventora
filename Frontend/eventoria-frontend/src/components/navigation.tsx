"use client"

import Link from "next/link"
import { useState } from "react"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-purple-400">EVENTORA</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/events" className="text-gray-300 hover:text-white transition-colors">
              Events
            </Link>
            <Link href="/tickets" className="text-gray-300 hover:text-white transition-colors">
              My Tickets
            </Link>
            <Link href="/create" className="text-gray-300 hover:text-white transition-colors">
              + Create Event
            </Link>
            <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">
              Profile
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/events" className="block px-3 py-2 text-gray-300 hover:text-white">
                Events
              </Link>
              <Link href="/tickets" className="block px-3 py-2 text-gray-300 hover:text-white">
                My Tickets
              </Link>
              <Link href="/create" className="block px-3 py-2 text-gray-300 hover:text-white">
                + Create Event
              </Link>
              <Link href="/profile" className="block px-3 py-2 text-gray-300 hover:text-white">
                Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}