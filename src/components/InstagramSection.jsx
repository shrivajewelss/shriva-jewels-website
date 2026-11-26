import { Instagram } from "lucide-react";
import { INSTAGRAM_URL } from "../utils/booking.js";
import { useCatalog } from "../context/CatalogContext.jsx";
import { resolveImageUrl } from "../utils/image.js";

export default function InstagramSection() {
  const { products } = useCatalog();
  const tiles = products.filter((p) => p.image).slice(0, 6);

  if (tiles.length === 0) return null;

  return (
    <section className="container-page pt-24" aria-labelledby="ig-h">
      <p className="eyebrow text-center">Follow along</p>
      <h2 id="ig-h" className="mt-2 text-center text-4xl sm:text-5xl">@shriva._jewels</h2>
      <ul className="mt-10 grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
        {tiles.map((p) => (
          <li key={p.id}>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open Shriva Jewels on Instagram - ${p.name}`}
              className="group block overflow-hidden rounded-md bg-sand"
            >
              <img
                src={resolveImageUrl(p.image)}
                alt={`${p.name} featured on Instagram`}
                loading="lazy"
                width="800"
                height="800"
                className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-8 text-center">
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
          <Instagram size={18} strokeWidth={1.5} aria-hidden="true" />
          Follow on Instagram
        </a>
      </div>
    </section>
  );
}
