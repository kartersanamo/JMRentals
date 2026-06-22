import { site } from "@/lib/site-config";
import Image from "next/image";
import Link from "next/link";

export const SITE_FAVICON_SRC = "/images/Logo_NoWords_NoBG_White.png";
export const SITE_LOGO_SRC = "/images/Logo_NoWords_NoBG_White.png";

const sizes = {
  xs: { width: 32, height: 32, className: "h-8 w-8" },
  sm: { width: 40, height: 40, className: "h-10 w-10" },
  md: { width: 48, height: 48, className: "h-12 w-12" },
  lg: { width: 64, height: 64, className: "h-16 w-16" },
  xl: { width: 80, height: 80, className: "h-20 w-20" },
} as const;

type SiteLogoProps = {
  size?: keyof typeof sizes;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  linked?: boolean;
  href?: string;
};

export function SiteLogo({
  size = "md",
  className = "",
  imageClassName = "",
  priority = false,
  linked = false,
  href = "/",
}: SiteLogoProps) {
  const config = sizes[size];
  const image = (
    <Image
      src={SITE_LOGO_SRC}
      alt={`${site.name} logo`}
      width={config.width}
      height={config.height}
      className={`object-contain ${config.className} ${imageClassName}`}
      priority={priority}
    />
  );

  if (linked) {
    return (
      <Link
        href={href}
        className={`inline-flex shrink-0 items-center hover:opacity-90 transition-opacity ${className}`}
        aria-label={`${site.name} home`}
      >
        {image}
      </Link>
    );
  }

  return (
    <span className={`inline-flex shrink-0 items-center ${className}`}>
      {image}
    </span>
  );
}
