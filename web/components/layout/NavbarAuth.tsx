"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function NavbarAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (session?.user) {
    return (
      <li>
        <Link
          href="/portal"
          className="text-sm uppercase tracking-widest text-gold hover:text-cream transition-colors"
        >
          My Portal
        </Link>
      </li>
    );
  }

  return (
    <li>
      <Link
        href="/login"
        className="text-sm uppercase tracking-widest text-cream/90 hover:text-gold transition-colors"
      >
        Sign In
      </Link>
    </li>
  );
}
