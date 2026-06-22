"use client";

import { ActionForm } from "@/components/portal/ActionForm";
import { Button } from "@/components/ui/Button";
import { ImageUrlPicker } from "@/components/admin/ImageUrlPicker";
import { updateSiteGallery } from "@/lib/actions/admin-settings";
import {
  uniqueGalleryCategoryId,
} from "@/lib/gallery-categories";
import type { SiteGalleryCategory, SiteGalleryImage } from "@/lib/settings/types";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const fieldClass =
  "w-full border border-navy/20 px-4 py-3 text-navy bg-white focus:outline-none focus:border-gold";
const labelClass =
  "block text-xs uppercase tracking-widest text-navy/70 mb-2";

function emptyGalleryItem(
  gallery: SiteGalleryImage[],
  categories: SiteGalleryCategory[]
): SiteGalleryImage {
  return {
    src: gallery[0]?.src ?? "",
    category: categories[0]?.id ?? "inside",
    alt: "",
  };
}

export function GalleryManager({
  initialGallery,
  initialCategories,
}: {
  initialGallery: SiteGalleryImage[];
  initialCategories: SiteGalleryCategory[];
}) {
  const [categories, setCategories] = useState<SiteGalleryCategory[]>(
    initialCategories.length > 0 ? initialCategories : [{ id: "inside", label: "Inside" }]
  );
  const [items, setItems] = useState<SiteGalleryImage[]>(
    initialGallery.length > 0
      ? initialGallery
      : [emptyGalleryItem(initialGallery, categories)]
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
    setItems((current) => [...current, emptyGalleryItem(current, categories)]);
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.length === 1
        ? [emptyGalleryItem(current, categories)]
        : current.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function updateCategoryLabel(index: number, label: string) {
    setCategories((current) =>
      current.map((category, categoryIndex) =>
        categoryIndex === index ? { ...category, label } : category
      )
    );
  }

  function addCategory() {
    const label = "New Category";
    setCategories((current) => [
      ...current,
      {
        id: uniqueGalleryCategoryId(
          label,
          current.map((item) => item.id)
        ),
        label,
      },
    ]);
  }

  function removeCategory(index: number) {
    setCategories((current) => {
      if (current.length === 1) return current;
      const removed = current[index];
      const next = current.filter((_, categoryIndex) => categoryIndex !== index);
      const fallbackId = next[0]?.id ?? "inside";
      setItems((galleryItems) =>
        galleryItems.map((item) =>
          item.category === removed.id ? { ...item, category: fallbackId } : item
        )
      );
      return next;
    });
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h3 className="font-display text-xl text-navy">Gallery categories</h3>
          <p className="text-sm text-navy/60 mt-1">
            These appear as filters on the public gallery page. Rename, add, or remove
            categories as needed.
          </p>
        </div>

        <div className="space-y-3">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="flex flex-wrap items-end gap-3 border border-navy/10 p-4 bg-white"
            >
              <div className="flex-1 min-w-[12rem]">
                <label
                  className={labelClass}
                  htmlFor={`gallery-category-label-${index}`}
                >
                  Display name
                </label>
                <input
                  id={`gallery-category-label-${index}`}
                  value={category.label}
                  onChange={(event) =>
                    updateCategoryLabel(index, event.target.value)
                  }
                  className={fieldClass}
                />
              </div>
              <div className="flex-1 min-w-[12rem]">
                <p className={labelClass}>Internal id</p>
                <p className="text-sm text-navy/60 font-mono px-1 py-3">
                  {category.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeCategory(index)}
                disabled={categories.length === 1}
                className="text-navy/50 hover:text-red-700 disabled:opacity-30 disabled:hover:text-navy/50 p-2"
                aria-label={`Remove category ${category.label}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <Button type="button" variant="outline" size="sm" onClick={addCategory}>
          <Plus size={16} className="mr-1 inline" aria-hidden />
          Add category
        </Button>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="font-display text-xl text-navy">Gallery photos</h3>
          <p className="text-sm text-navy/60 mt-1">
            Assign each photo to one of your categories.
          </p>
        </div>

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
              galleryCategories={categories}
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
                    updateItem(index, "category", event.target.value)
                  }
                  className={fieldClass}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
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
      </section>

      <ActionForm
        action={updateSiteGallery}
        successMessage="Gallery saved."
        submitLabel="Save gallery"
      >
        <input type="hidden" name="galleryJson" value={JSON.stringify(items)} />
        <input
          type="hidden"
          name="galleryCategoriesJson"
          value={JSON.stringify(categories)}
        />
      </ActionForm>

      <p className="text-sm text-navy/60">
        Gallery photos appear on the public gallery page, homepage preview, and in
        admin image pickers. You can also paste a direct URL for any image field.
      </p>
    </div>
  );
}
