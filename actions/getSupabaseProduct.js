"use server";

import { createClient } from "@/lib/supabase/server";

const SCHEMA = "shopping_list";

const PRODUCT_SELECT = `
         id,
         name,
         category_id,
         image_url,
         user_id,
         category:categories (
            id,
            name
         )
      `;

/** Catalogue : produits publics (`user_id` null) + produits perso de l’utilisateur connecté. */
export async function getSupabaseProducts() {
   const supabaseAuth = await createClient();
   const {
      data: { user },
   } = await supabaseAuth.auth.getUser();

   let query = supabaseAuth
      .schema(SCHEMA)
      .from("products")
      .select(PRODUCT_SELECT)
      .order("name", { ascending: true });

   if (user?.id) {
      query = query.or(`user_id.is.null,user_id.eq.${user.id}`);
   } else {
      query = query.is("user_id", null);
   }

   const { data, error } = await query;

   if (error) {
      console.error("Error reading products:", error.message);
      throw new Error(error.message);
   }

   return data ?? [];
}

/** Produits dont `user_id` = utilisateur connecté (page « mes produits »). */
export async function getSupabaseMyProducts() {
   const supabaseAuth = await createClient();
   const {
      data: { user },
   } = await supabaseAuth.auth.getUser();

   if (!user?.id) {
      return [];
   }

   const { data, error } = await supabaseAuth
      .schema(SCHEMA)
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("user_id", user.id)
      .order("name", { ascending: true });

   if (error) {
      console.error("Error reading my products:", error.message);
      throw new Error(error.message);
   }

   return data ?? [];
}

export async function getSupabaseCategories() {
   const supabaseAuth = await createClient();
   const { data, error } = await supabaseAuth
      .schema(SCHEMA)
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true });

   if (error) {
      console.error("Error reading categories:", error.message);
      throw new Error(error.message);
   }

   return data ?? [];
}
