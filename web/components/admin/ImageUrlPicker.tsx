"use client";

import {
  CUSTOM_GALLERY_VALUE,
  formatGalleryOptionLabel,
  getInitialImagePickerState,
  resolveImagePickerValue,
} from "@/lib/gallery-options";
import type { SiteGalleryCategory, SiteGalleryImage } from "@/lib/settings/types";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const labelClass =
  "block text-xs uppercase tracking-widest text-navy/70 mb-2";
const fieldClass =
  "w-full border border-navy/20 px-4 py-3 text-navy bg-white focus:outline-none focus:border-gold";

type ImageUrlPickerProps = {
  name?: string;
  inputId?: string;
  galleryImages: SiteGalleryImage[];
  galleryCategories?: SiteGalleryCategory[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  compact?: boolean;
};

export function ImageUrlPicker({
  name,
  inputId,
  galleryImages,
  galleryCategories = [],
  defaultValue = "",
  value,
  onChange,
  label = "Image",
  placeholder = "https://example.com/photo.jpg",
  className = "",
  inputClassName = fieldClass,
  compact = false,
}: ImageUrlPickerProps) {
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : defaultValue;

  const initial = useMemo(
    () => getInitialImagePickerState(currentValue, galleryImages),
    [currentValue, galleryImages]
  );

  const [mode, setMode] = useState<"gallery" | "custom">(initial.mode);
  const [galleryValue, setGalleryValue] = useState(initial.galleryValue);
  const [customValue, setCustomValue] = useState(initial.customValue);

  useEffect(() => {
    const next = getInitialImagePickerState(currentValue, galleryImages);
    setMode(next.mode);
    setGalleryValue(next.galleryValue);
    setCustomValue(next.customValue);
  }, [currentValue, galleryImages]);

  const resolvedValue = resolveImagePickerValue(mode, galleryValue, customValue);
  const selectValue =
    mode === "custom" ? CUSTOM_GALLERY_VALUE : galleryValue;
  const pickerId = inputId ?? `${name ?? "image"}-picker`;

  function emitChange(nextValue: string) {
    onChange?.(nextValue);
  }

  function handleSelectChange(next: string) {
    if (next === CUSTOM_GALLERY_VALUE) {
      setMode("custom");
      emitChange(customValue.trim());
      return;
    }

    setMode("gallery");
    setGalleryValue(next);
    emitChange(next);
  }

  function handleCustomChange(next: string) {
    setCustomValue(next);
    emitChange(next.trim());
  }

  return (
    <div className={className}>
      {label && (
        <label className={labelClass} htmlFor={pickerId}>
          {label}
        </label>
      )}

      <select
        id={pickerId}
        value={selectValue}
        onChange={(event) => handleSelectChange(event.target.value)}
        className={inputClassName}
      >
        <option value="">
          {galleryImages.length === 0
            ? "No gallery photos yet"
            : "Choose a gallery photo…"}
        </option>
        {galleryImages.map((image) => (
          <option key={image.src} value={image.src}>
            {formatGalleryOptionLabel(image, galleryCategories)}
          </option>
        ))}
        <option value={CUSTOM_GALLERY_VALUE}>Custom URL…</option>
      </select>

      {mode === "custom" && (
        <input
          type="url"
          value={customValue}
          onChange={(event) => handleCustomChange(event.target.value)}
          placeholder={placeholder}
          className={`${inputClassName} mt-2`}
        />
      )}

      {name ? <input type="hidden" name={name} value={resolvedValue} /> : null}

      {resolvedValue ? (
        <div
          className={`relative mt-3 overflow-hidden border border-navy/10 bg-navy/5 ${
            compact ? "h-20 w-32" : "h-28 w-full max-w-sm"
          }`}
        >
          <Image
            src={resolvedValue}
            alt="Selected image preview"
            fill
            className="object-cover"
            sizes={compact ? "128px" : "384px"}
          />
        </div>
      ) : (
        <p className="mt-2 text-xs text-navy/50">
          Choose a gallery photo or enter a direct image URL.
        </p>
      )}
    </div>
  );
}
