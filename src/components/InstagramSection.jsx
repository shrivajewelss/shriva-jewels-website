import { Instagram } from "lucide-react";
import { INSTAGRAM_URL } from "../utils/booking.js";

// Same six tiles as the live homepage. They are catalogue photos linking to the profile —
// no posts, likes or follower counts are fabricated.
const tiles = ["p04", "p22", "p42", "p09", "p32", "p56"];

export default function InstagramSection() {
  return (
    <section className="container-page pt-24" aria-labelledby="ig-h">
      <p className="eyebrow text-center">Follow along</p>
      <h2 id="ig-h" className="mt-2 text-center text-4xl sm:text-5xl">@shriva._jewels</h2>
      <ul className="mt-10 grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
        {tiles.map((t) => (
          <li key={t}>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Open Shriva Jewels on Instagram" className="group block overflow-hidden rounded-md bg-sand">
              <img src={`/images/products/${t}.jpg`} alt="" loading="lazy" width="800" height="800" className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-8 text-center">
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn btn-outline"><Instagram size={18} strokeWidth={1.5} aria-hidden="true" />Follow on Instagram</a>
      </div>
    </section>
  );
}
