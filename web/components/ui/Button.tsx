import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-gold text-navy hover:bg-gold-light shadow-md hover:shadow-lg",
  secondary:
    "bg-navy text-cream hover:bg-navy-light shadow-md hover:shadow-lg",
  ghost:
    "bg-transparent text-cream border border-cream/60 hover:bg-cream/10",
  outline:
    "bg-transparent text-navy border-2 border-navy hover:bg-navy hover:text-cream",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm tracking-wide",
  lg: "px-8 py-4 text-base tracking-wide",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface ButtonLinkProps {
  href: string;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
  external?: boolean;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  children,
  className = "",
  external = false,
}: ButtonLinkProps) {
  const classes = `inline-flex items-center justify-center font-medium uppercase transition-all duration-300 ${variants[variant]} ${sizes[size]} ${className}`;

  if (external) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
