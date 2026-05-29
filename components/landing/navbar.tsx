/**
 * components/landing/navbar.tsx
 *
 * Sticky navigation bar for the landing page, matching Lovable's design.
 * Features:
 * - Logo "Lovable Clone" on the left
 * - Auth-aware buttons on the right:
 *   - Logged out: "Log in" (outline) + "Get started" (filled)
 *   - Logged in: "Dashboard" button
 * - Transparent background with backdrop-blur for glass effect
 * - No border — blends cleanly into the gradient background
 *
 * This is a Server Component with Clerk client islands for auth state.
 *
 * Used by: app/(marketing)/page.tsx
 */

import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

/**
 * Navbar renders the top navigation bar on the landing page.
 * Matches Lovable's clean, minimal navbar sitting on top of the gradient.
 */
export function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full bg-white/40 backdrop-blur-md border-b border-slate-200/40">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-800 hover:text-slate-950 transition-colors"
        >
          <img src="/logo.png" alt="" className="size-7" />
          Dreamera
        </Link>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <SignedOut>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-200/80 bg-white/60 text-slate-700 hover:bg-slate-50 hover:text-slate-950 hover:brightness-100"
              asChild
            >
              <Link href="/sign-in">Log in</Link>
            </Button>
            <Button
              size="sm"
              className="bg-[#f15a24] hover:bg-[#d94814] text-white shadow-sm transition-all duration-150"
              asChild
            >
              <Link href="/sign-up">Get started</Link>
            </Button>
          </SignedOut>

          <SignedIn>
            <Button
              size="sm"
              className="bg-[#f15a24] hover:bg-[#d94814] text-white shadow-sm transition-all duration-150"
              asChild
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}
