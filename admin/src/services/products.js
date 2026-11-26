import { supabase } from "./supabase.js";
import { logAdminActivity } from "./audit.js";

function extractInventory(inventoryField) {
  if (Array.isArray(inventoryField)) return inventoryField[0] || null;
  return inventoryField || null;
}

export async function getProducts({ search = "", categoryId = "", status = "" } = {}) {
  let query = supabase
    .from("products")
    .select(`
      id,
      category_id,
      name,
      slug,
      description,
      sku,
      price,
      sale_price,
      status,
      is_featured,
      created_by,
      units,
      image_url,
      created_at,
      updated_at,
      categories ( id, name, slug ),
      inventory ( id, product_id, quantity, low_stock_threshold, updated_at )
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
    const inv = extractInventory(p.inventory);
    return {
      ...p,
      main_image: p.image_url || "/images/products/p02.jpg",
      stock_quantity: inv?.quantity ?? p.units ?? 0,
      low_stock_threshold: inv?.low_stock_threshold ?? 5,
      inventory_id: inv?.id || null,
    };
  });

  return { data: formatted, error: null };
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      category_id,
      name,
      slug,
      description,
      sku,
      price,
      sale_price,
      status,
      is_featured,
      created_by,
      units,
      image_url,
      created_at,
      updated_at,
      categories ( id, name, slug ),
      inventory ( id, product_id, quantity, low_stock_threshold, updated_at )
    `)
    .eq("id", id)
    .single();

  if (error) return { data: null, error: error.message };

  const inv = extractInventory(data.inventory);
  return {
    data: {
      ...data,
      main_image: data.image_url || "/images/products/p02.jpg",
      stock_quantity: inv?.quantity ?? data.units ?? 0,
      low_stock_threshold: inv?.low_stock_threshold ?? 5,
      inventory_id: inv?.id || null,
    },
    error: null,
  };
}

export async function createProduct(productData, initialStock = 0) {
  const sku = (productData.sku || "").trim();
  if (!sku) {
    return { data: null, error: "SKU is required by the database schema." };
  }

  const slug =
    (productData.slug || "").trim() ||
    productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const { data: sessionData } = await supabase.auth.getSession();
  const adminId = sessionData?.session?.user?.id || null;

  const unitsCount = Math.max(0, parseInt(productData.units ?? initialStock, 10) || 0);
  const salePrice =
    productData.sale_price !== "" && productData.sale_price != null
      ? Number(productData.sale_price)
      : null;

  const { data: product, error } = await supabase
    .from("products")
    .insert([
      {
        name: productData.name,
        slug,
        description: productData.description || null,
        sku,
        price: Number(productData.price) || 0,
        sale_price: salePrice,
        category_id: productData.category_id || null,
        status: productData.status || "draft",
        is_featured: Boolean(productData.is_featured),
        created_by: adminId,
        units: unitsCount,
        image_url: productData.image_url || null,
      },
    ])
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  // Attempt to create initial inventory row (may be restricted if RLS only allows SELECT on inventory)
  const { error: invErr } = await supabase.from("inventory").insert([
    {
      product_id: product.id,
      quantity: Math.max(0, Number(initialStock) || 0),
    },
  ]);
  if (invErr) {
    console.warn("Inventory initial row notice:", invErr.message);
  }

  await logAdminActivity("create_product", { product_id: product.id, name: product.name }, { entityType: "product", entityId: product.id });

  return { data: product, error: null };
}

export async function updateProduct(id, productData) {
  const salePrice =
    productData.sale_price !== "" && productData.sale_price != null
      ? Number(productData.sale_price)
      : null;

  const updatePayload = {
    name: productData.name,
    slug: productData.slug,
    description: productData.description || null,
    sku: productData.sku,
    price: Number(productData.price),
    sale_price: salePrice,
    category_id: productData.category_id || null,
    status: productData.status,
    is_featured: Boolean(productData.is_featured),
    image_url: productData.image_url || null,
    updated_at: new Date().toISOString(),
  };

  if (productData.units !== undefined && productData.units !== "") {
    updatePayload.units = Math.max(0, parseInt(productData.units, 10) || 0);
  }

  const { data: product, error } = await supabase
    .from("products")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  await logAdminActivity("update_product", { product_id: id, updates: productData }, { entityType: "product", entityId: id });

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
    await logAdminActivity("archive_product", { product_id: id, new_status: newStatus }, { entityType: "product", entityId: id });
  }

  return { data, error: error?.message };
}

export async function deleteProduct(id, name) {
  // Check if product is referenced in order_items or stock_movements before deleting
  const [{ count: orderItemCount }, { count: movementCount }] = await Promise.all([
    supabase.from("order_items").select("*", { count: "exact", head: true }).eq("product_id", id),
    supabase.from("stock_movements").select("*", { count: "exact", head: true }).eq("product_id", id),
  ]);

  if ((orderItemCount && orderItemCount > 0) || (movementCount && movementCount > 0)) {
    return {
      error: `Cannot delete product: It has ${orderItemCount || 0} order item(s) and ${movementCount || 0} stock movement(s). Please archive it instead to preserve history.`,
    };
  }

  await supabase.from("inventory").delete().eq("product_id", id);
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (!error) {
    await logAdminActivity("delete_product", { product_id: id, name }, { entityType: "product", entityId: id });
  }

  return { error: error?.message };
}
