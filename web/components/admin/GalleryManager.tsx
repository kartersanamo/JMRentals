"use client";

import { ActionForm } from "@/components/portal/ActionForm";
import { Button } from "@/components/ui/Button";
import { ImageUrlPicker } from "@/components/admin/ImageUrlPicker";
import { updateSiteGallery } from "@/lib/actions/admin-settings";
import type { SiteGalleryImage } from "@/lib/settings/types";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const fieldClass =
  "w-full border border-navy/20 px-4 py-3 text-navy bg-white focus:outline-none focus:border-gold";
const labelClass =
  "block text-xs uppercase tracking-widest text-navy/70 mb-2";

function emptyGalleryItem(gallery: SiteGalleryImage[]): SiteGalleryImage {
  return {
    src: gallery[0]?.src ?? "",
    category: "inside",
    alt: "",
  };
}

export function GalleryManager({
  initialGallery,
}: {
  initialGallery: SiteGalleryImage[];
}) {
  const [items, setItems] = useState<SiteGalleryImage[]>(
    initialGallery.length > 0 ? initialGallery : [emptyGalleryItem(initialGallery)]
  );

  function updateItem(
    index: number,
    field: keyof SiteGalleryImage,
    value: string
  ) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  }

  function addItem() {
    setItems((current) => [...current, emptyGalleryItem(current)]);
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.length === 1
        ? [emptyGalleryItem(current)]
        : current.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={`gallery-item-${index}`}
          className="border border-navy/10 p-4 space-y-4 bg-sage-light/20"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium text-navy">Photo {index + 1}</p>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-navy/50 hover:text-red-700 p-1"
              aria-label={`Remove photo ${index + 1}`}
            >
              <Trash2 size={16} />
            </button>
          </div>

          <ImageUrlPicker
            galleryImages={items.filter((_, itemIndex) => itemIndex !== index)}
            value={item.src}
            onChange={(value) => updateItem(index, "src", value)}
            label="Photo URL"
            inputClassName={fieldClass}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor={`gallery-category-${index}`}>
                Category
              </label>
              <select
                id={`gallery-category-${index}`}
                value={item.category}
                onChange={(event) =>
                  updateItem(
                    index,
                    "category",
                    event.target.value as SiteGalleryImage["category"]
                  )
                }
                className={fieldClass}
              >
                <option value="inside">Inside</option>
                <option value="outside">Outside</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor={`gallery-alt-${index}`}>
                Alt text
              </label>
              <input
                id={`gallery-alt-${index}`}
                value={item.alt}
                onChange={(event) => updateItem(index, "alt", event.target.value)}
                placeholder="Describe the photo for accessibility"
                className={fieldClass}
              />
            </div>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus size={16} className="mr-1 inline" aria-hidden />
        Add gallery photo
      </Button>

      <ActionForm
        action={updateSiteGallery}
        successMessage="Gallery saved."
        submitLabel="Save gallery"
      >
        <input type="hidden" name="galleryJson" value={JSON.stringify(items)} />
      </ActionForm>

      <p className="text-sm text-navy/60">
        Gallery photos appear on the public gallery page, homepage preview, and in
        admin image pickers. You can also paste a direct URL for any image field.
      </p>
    </div>
  );
}
