"use client";

import type { GalleryImage } from "@/lib/site-config";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect } from "react";

interface LightboxProps {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
}: LightboxProps) {
  const current = images[index];

  const goPrev = useCallback(() => {
    onNavigate(index === 0 ? images.length - 1 : index - 1);
  }, [index, images.length, onNavigate]);

  const goNext = useCallback(() => {
    onNavigate(index === images.length - 1 ? 0 : index + 1);
  }, [index, images.length, onNavigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, goPrev, goNext]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-navy/95 flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery lightbox"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 md:top-8 md:right-8 text-cream hover:text-gold p-2 z-10"
        aria-label="Close lightbox"
      >
        <X size={32} />
      </button>

      <button
        type="button"
        onClick={goPrev}
        className="absolute left-2 md:left-6 text-cream hover:text-gold p-2 z-10"
        aria-label="Previous image"
      >
        <ChevronLeft size={40} />
      </button>

      <button
        type="button"
        onClick={goNext}
        className="absolute right-2 md:right-6 text-cream hover:text-gold p-2 z-10"
        aria-label="Next image"
      >
        <ChevronRight size={40} />
      </button>

      <div className="relative w-full max-w-5xl aspect-[4/3] md:aspect-[16/10]">
        <Image
          src={current.src}
          alt={current.alt}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 80vw"
          priority
        />
      </div>

      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-cream/80 text-sm text-center max-w-lg px-4">
        {current.alt} · {index + 1} / {images.length}
      </p>
    </div>
  );
}
