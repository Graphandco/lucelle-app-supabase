/**
 * Regroupe des produits par catégorie pour l’affichage en sections.
 * Si la liste `categories` est vide (ex. RLS), dérive les sections depuis les produits.
 *
 * @param {Array<{ category?: { id?: string, name?: string } | null }>} products
 * @param {Array<{ id: string, name: string }>} [categories]
 * @returns {Array<{ category: { id: string, name: string }, products: typeof products }>}
 */
export function groupProductsByCategory(products, categories = []) {
   if (categories.length > 0) {
      return categories
         .map((category) => ({
            category,
            products: products.filter(
               (product) => product.category?.id === category.id,
            ),
         }))
         .filter((group) => group.products.length > 0);
   }

   const byCategoryId = new Map();

   for (const product of products) {
      const id = product.category?.id ?? "none";
      if (!byCategoryId.has(id)) {
         byCategoryId.set(id, {
            category: {
               id,
               name: product.category?.name ?? "Sans catégorie",
            },
            products: [],
         });
      }
      byCategoryId.get(id).products.push(product);
   }

   return [...byCategoryId.values()].sort((a, b) =>
      a.category.name.localeCompare(b.category.name, "fr", {
         sensitivity: "base",
      }),
   );
}
