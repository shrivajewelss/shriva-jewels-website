import { Link } from "react-router-dom";

export default function StorySection() {
  return (
    <section className="mt-24 bg-sand">
      <div className="container-page grid items-center gap-10 py-16 md:grid-cols-2 lg:gap-16">
        <img src="/images/products/p48.jpg" alt="Sapphire halo cocktail ring" width="800" height="1200" loading="lazy" className="aspect-[4/5] w-full rounded-lg object-cover" />
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
