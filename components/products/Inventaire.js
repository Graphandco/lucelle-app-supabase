"use client";

import { useCatalogData } from "@/hooks/useCatalogData";
import ProductCard from "@/components/products/ProductCard";
import { groupProductsByCategory } from "@/lib/groupProductsByCategory";
import { useCallback, useMemo, useState } from "react";

function normalizeText(text) {
   return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
}

export default function Inventaire() {
   const {
      products: allProducts,
      categories,
      loading,
      reload,
      patchProduct,
   } = useCatalogData();
   const [searchTerm, setSearchTerm] = useState("");

   const reconcile = useCallback(() => reload({ silent: true }), [reload]);

   const filteredProducts = useMemo(() => {
      const q = normalizeText(searchTerm);
      if (!q) return allProducts;
      return allProducts.filter((product) =>
         normalizeText(product.name).includes(q),
      );
   }, [allProducts, searchTerm]);

   const productGroups = useMemo(
      () => groupProductsByCategory(filteredProducts, categories),
      [filteredProducts, categories],
   );

   if (loading) {
      return <div>Chargement...</div>;
   }

   return (
      <div>
         <div className="flex justify-between items-center">
            <h1 className="text-lg mb-3 px-1 text-primary flex items-center gap-2">
               Inventaire
               <span className="text-base text-white mt-1">
                  ({filteredProducts.length}
                  {searchTerm.trim() && allProducts.length !== filteredProducts.length
                     ? ` / ${allProducts.length}`
                     : null}
                  )
               </span>
            </h1>
         </div>

         <div className="relative mb-4 px-1">
            <input
               type="text"
               placeholder="Filtrer par nom…"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="bg-card outline-none border-none rounded-lg w-full py-2 px-4 placeholder:text-white/50 placeholder:italic placeholder:text-sm placeholder:font-light"
               autoComplete="off"
               spellCheck="false"
            />
         </div>

         {filteredProducts.length === 0 && searchTerm.trim() ? (
            <p className="px-1 text-center text-sm text-white/60">
               Aucun produit ne correspond à « {searchTerm.trim()} ».
            </p>
         ) : null}

         {productGroups.map(({ category, products: productsInCategory }) => (
            <div key={category.id} className="mb-6">
               <h3 className="text-lg text-white font-medium mb-2">
                  {category.name}
               </h3>
               <ul className="rounded-lg px-3 pb-2">
                  {productsInCategory.map((product) => (
                     <ProductCard
                        key={product.documentId}
                        product={product}
                        pageType="inventaire"
                        patchProduct={patchProduct}
                        reconcile={reconcile}
                     />
                  ))}
               </ul>
            </div>
         ))}
      </div>
   );
}
