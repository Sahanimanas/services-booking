import { revalidatePath } from "next/cache";

/**
 * Re-render the public storefront pages that read catalog data
 * (services, products, categories, prices, discounts, availability).
 *
 * The storefront pages use time-based caching (`export const revalidate`),
 * so without this they keep serving stale data for up to a couple of minutes
 * after an admin change. Calling this from an admin mutation route makes the
 * backend invalidate those pages immediately, so the frontend stays in sync.
 */
export function revalidateStorefront() {
  revalidatePath("/"); // home — featured services, categories, deals
  revalidatePath("/services"); // catalog listing (services & products tabs)
  revalidatePath("/services/[slug]", "page"); // every service detail page
}
