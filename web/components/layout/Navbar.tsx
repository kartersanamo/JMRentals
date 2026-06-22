"use client";

import { NavbarAuth } from "@/components/layout/NavbarAuth";
import { SiteLogo } from "@/components/brand/SiteLogo";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/#welcome", label: "Home" },
  { href: "/amenities", label: "Amenities" },
  { href: "/gallery", label: "Gallery" },
  { href: "/#location", label: "Location" },
  { href: "/#contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || open
          ? "bg-navy/95 backdrop-blur-md shadow-lg py-3"
          : "bg-transparent py-5"
      }`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-12 lg:px-20"
        aria-label="Main navigation"
      >
        <SiteLogo size="lg" linked priority className="md:scale-110" />

        <ul className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm uppercase tracking-widest text-cream/90 hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <NavbarAuth />
          <li>
            <Link
              href="/book"
              className="inline-flex items-center bg-gold/20 border border-gold/50 text-gold px-4 py-2 text-xs uppercase tracking-widest hover:bg-gold hover:text-navy transition-all"
            >
              Book Now
            </Link>
          </li>
        </ul>

        <button
          type="button"
          className="lg:hidden text-cream p-2"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden fixed inset-0 top-[60px] bg-navy z-40 px-8 py-10">
          <ul className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-xl font-display text-cream hover:text-gold transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-xl font-display text-gold hover:text-cream transition-colors"
              >
                Sign In / Portal
              </Link>
            </li>
            <li>
              <Link
                href="/book"
                onClick={() => setOpen(false)}
                className="text-xl font-display text-gold hover:text-cream transition-colors"
              >
                Book Now
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
