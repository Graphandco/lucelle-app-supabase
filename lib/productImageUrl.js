import { shoppingListObjectPathFromImageUrl } from "@/lib/shoppingListStoragePath";

const STORAGE_BUCKET = "shopping_list";

function supabasePublicObjectUrl(objectPath) {
   const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
   if (!base || !objectPath) return null;
   return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${objectPath}`;
}

/**
 * URL affichable pour la vignette produit (Supabase Storage ou chemin absolu).
 * Réécrit les URLs héritées (ex. self-hosted) vers le host Supabase courant.
 * @param {{ imageUrl?: string | null }} product
 * @returns {string | null}
 */
export function resolveProductImageUrl(product) {
   const raw =
      typeof product?.imageUrl === "string" ? product.imageUrl.trim() : "";
   if (!raw) return null;

   if (raw.startsWith("/")) return raw;

   if (raw.startsWith("http://") || raw.startsWith("https://")) {
      const objectPath = shoppingListObjectPathFromImageUrl(raw);
      if (objectPath) {
         const normalized = supabasePublicObjectUrl(objectPath);
         if (normalized) return normalized;
      }
      return raw;
   }

   const objectPath = shoppingListObjectPathFromImageUrl(raw);
   if (objectPath) {
      const normalized = supabasePublicObjectUrl(objectPath);
      if (normalized) return normalized;
   }

   return null;
}
