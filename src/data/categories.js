// Order and wording verified against the live site's "Shop by category" section.
// Category card images: the live site's card images could not be inspected (no browser), so the
// first catalogue piece of each category is used — see docs/REFERENCE_AUDIT.md.
export const categories = [
  { slug: "earrings", name: "Earrings", description: "Hoops, studs & ear cuffs", image: "/images/products/p27.jpg" },
  { slug: "necklaces", name: "Necklaces", description: "Delicate chains & pendants", image: "/images/products/p34.jpg" },
  { slug: "rings", name: "Rings", description: "Stone-set statement rings", image: "/images/products/p48.jpg" },
  { slug: "bracelets", name: "Bracelets", description: "Bracelets, cuffs & hand chains", image: "/images/products/p02.jpg" },
  { slug: "anklets", name: "Anklets", description: "Charm anklets", image: "/images/products/p04.jpg" },
];
export const categoriesBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));
