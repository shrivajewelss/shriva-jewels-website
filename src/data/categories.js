// Order and wording verified against the live site's "Shop by category" section.
export const categories = [
  { slug: "earrings", name: "Earrings", description: "Hoops, studs & drop earrings", image: "images/products/01_heart_hoops.png" },
  { slug: "earcuffs", name: "Ear Cuffs", description: "Trendy ear cuffs & stacks", image: "images/products/Elegant Gold Ear Cuff Stack.png" },
  { slug: "mangalsutra", name: "Mangalsutra", description: "Traditional & modern mangalsutra", image: "images/products/Golden Mangalsutra Crescent Pendant.png" },
  { slug: "necklaces", name: "Necklaces", description: "Delicate chains & pendants", image: "images/products/Delicate Gold Hexagon Pendant Necklace.png" },
  { slug: "rings", name: "Rings", description: "Stone-set statement rings", image: "images/products/Elegant Gold Leaf Diamond Ring.png" },
  { slug: "bracelets", name: "Bracelets", description: "Bracelets, cuffs & hand chains", image: "images/products/Gold Tennis Bracelet with Lotus Charm.png" },
  { slug: "anklets", name: "Anklets", description: "Charm anklets", image: "images/products/p05.jpg" }
];
export const categoriesBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));
