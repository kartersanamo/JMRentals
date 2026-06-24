import { describe, expect, it } from "vitest";
import { normalizeGalleryCategories } from "@/lib/gallery-categories";

describe("normalizeGalleryCategories", () => {
  it("falls back to defaults when input is empty", () => {
    const categories = normalizeGalleryCategories([]);
    expect(categories).toEqual([
      { id: "inside", label: "Inside" },
      { id: "outside", label: "Outside" },
    ]);
  });

  it("deduplicates category ids", () => {
    const categories = normalizeGalleryCategories([
      { id: "pool", label: "Pool" },
      { id: "pool", label: "Pool Area" },
    ]);
    expect(categories).toEqual([{ id: "pool", label: "Pool" }]);
  });
});
