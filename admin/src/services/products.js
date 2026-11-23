import { supabase } from "./supabase.js";
import { logAdminActivity } from "./audit.js";

export async function getProducts({ search = "", categoryId = "", status = "" } = {}) {
  let query = supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      description,
      sku,
      price,
      status,
      is_featured,
      category_id,
      created_at,
      updated_at,
      categories ( id, name, slug ),
      product_images ( id, image_url, sort_order, alt_text, width, height, format ),
      inventory ( id, quantity, updated_at )
    `)
    .order("created_at", { ascending: false });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }
  if (status) {
    query = query.eq("status", status);
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,slug.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) return { data: [], error: error.message };

  const formatted = (data || []).map((p) => {
    const images = (p.product_images || []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    return {
      ...p,
      images,
      main_image: images[0]?.image_url || "/images/products/p02.jpg",
      stock_quantity: p.inventory?.[0]?.quantity ?? 0,
      inventory_id: p.inventory?.[0]?.id,
    };
  });

  return { data: formatted, error: null };
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      description,
      sku,
      price,
      status,
      is_featured,
      category_id,
      created_at,
      updated_at,
      categories ( id, name, slug ),
      product_images ( id, image_url, sort_order, alt_text ),
      inventory ( id, quantity )
    `)
    .eq("id", id)
    .single();

  if (error) return { data: null, error: error.message };

  const images = (data.product_images || []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  return {
    data: {
      ...data,
      images,
      main_image: images[0]?.image_url,
      stock_quantity: data.inventory?.[0]?.quantity ?? 0,
      inventory_id: data.inventory?.[0]?.id,
    },
    error: null,
  };
}

export async function createProduct(productData, images = [], initialStock = 0) {
  const slug =
    productData.slug ||
    productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const { data: product, error } = await supabase
    .from("products")
    .insert([
      {
        name: productData.name,
        slug,
        description: productData.description || "",
        sku: productData.sku || null,
        price: Number(productData.price) || 0,
        category_id: productData.category_id || null,
        status: productData.status || "active",
        is_featured: Boolean(productData.is_featured),
      },
    ])
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  // Create initial inventory row
  await supabase.from("inventory").insert([
    {
      product_id: product.id,
      quantity: Math.max(0, Number(initialStock) || 0),
    },
  ]);

  // Insert product images (max 5)
  const imagesToInsert = images.slice(0, 5).map((img, index) => ({
    product_id: product.id,
    image_url: typeof img === "string" ? img : img.image_url,
    sort_order: index,
    alt_text: product.name,
  }));

  if (imagesToInsert.length > 0) {
    await supabase.from("product_images").insert(imagesToInsert);
  }

  await logAdminActivity("create_product", { product_id: product.id, name: product.name });

  return { data: product, error: null };
}

export async function updateProduct(id, productData, images = null) {
  const { data: product, error } = await supabase
    .from("products")
    .update({
      name: productData.name,
      slug: productData.slug,
      description: productData.description,
      sku: productData.sku,
      price: Number(productData.price),
      category_id: productData.category_id,
      status: productData.status,
      is_featured: Boolean(productData.is_featured),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  // If images array is provided, synchronize product_images table
  if (Array.isArray(images)) {
    // Delete existing images for this product
    await supabase.from("product_images").delete().eq("product_id", id);

    // Insert updated images (max 5)
    const imagesToInsert = images.slice(0, 5).map((img, index) => ({
      product_id: id,
      image_url: typeof img === "string" ? img : img.image_url,
      sort_order: index,
      alt_text: product.name,
    }));

    if (imagesToInsert.length > 0) {
      await supabase.from("product_images").insert(imagesToInsert);
    }
  }

  await logAdminActivity("update_product", { product_id: id, updates: productData });

  return { data: product, error: null };
}

export async function archiveProduct(id, currentStatus) {
  const newStatus = currentStatus === "archived" ? "active" : "archived";
  const { data, error } = await supabase
    .from("products")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (!error) {
    await logAdminActivity("archive_product", { product_id: id, new_status: newStatus });
  }

  return { data, error: error?.message };
}

export async function deleteProduct(id, name) {
  // Check if product is referenced in order_items before deleting
  const { count: orderItemCount } = await supabase
    .from("order_items")
    .select("*", { count: "exact", head: true })
    .eq("product_id", id);

  if (orderItemCount && orderItemCount > 0) {
    return {
      error: `Cannot delete product: It is associated with ${orderItemCount} historical order(s). Please archive it instead to preserve sales history.`,
    };
  }

  // Safe to delete: remove associated inventory and images first
  await supabase.from("product_images").delete().eq("product_id", id);
  await supabase.from("inventory").delete().eq("product_id", id);
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (!error) {
    await logAdminActivity("delete_product", { product_id: id, name });
  }

  return { error: error?.message };
}
