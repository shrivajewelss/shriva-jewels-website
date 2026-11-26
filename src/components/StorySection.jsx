import { Link } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext.jsx";
import { resolveImageUrl } from "../utils/image.js";

export default function StorySection() {
  const { products } = useCatalog();
  const featuredItem = products.find((p) => p.isFeatured && p.image) || products.find((p) => p.image);
  const imageSrc = featuredItem ? resolveImageUrl(featuredItem.image) : "";

  return (
    <section className="mt-24 bg-sand">
      <div className="container-page grid items-center gap-10 py-16 md:grid-cols-2 lg:gap-16">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={`${featuredItem.name} — Shriva Jewels handcrafted fine fashion jewellery`}
            width="800"
            height="1200"
            loading="lazy"
            className="aspect-[4/5] w-full rounded-lg object-cover"
          />
        ) : (
          <div className="aspect-[4/5] w-full rounded-lg bg-cream/60" aria-hidden="true" />
        )}
        <div>
          <p className="eyebrow">Our story</p>
          <h2 className="mt-3 text-4xl sm:text-5xl">Made to make you feel special</h2>
          <p className="mt-5 max-w-lg leading-relaxed text-ink/80">
            Shriva Jewels brings together delicate everyday pieces and eye-catching statement styles — from dainty pendants and charm anklets to stone-set rings and ear cuffs. Every piece is chosen to help you express your style, whatever the moment.
          </p>
          <Link to="/products" className="btn btn-primary mt-8">Discover the collection</Link>
        </div>
      </div>
    </section>
  );
}
