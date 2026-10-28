import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="bg-sand">
      <div className="container-page grid items-center gap-10 py-14 md:grid-cols-2 md:py-20 lg:gap-16">
        <div className="order-2 md:order-1">
          <p className="eyebrow">The Shriva Collection</p>
          <h1 className="mt-4 text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
            Jewellery That <em className="italic">Speaks</em> Your Style
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink/80 sm:text-lg">
            Discover beautiful pieces for every moment, made to make you feel special.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#collections" className="btn btn-primary">Explore Collection</a>
            <Link to="/products" className="btn btn-outline">Shop Now</Link>
          </div>
        </div>
        <div className="order-1 grid grid-cols-5 gap-3 md:order-2">
          <img src="/images/products/p02.jpg" alt="Gemstone hand chain worn on a hand" width="800" height="1200" fetchPriority="high"
            className="col-span-3 row-span-2 aspect-[3/4] h-full w-full rounded-lg object-cover" />
          <img src="/images/products/p34.jpg" alt="Gemstone lariat necklace" width="900" height="1200" className="col-span-2 aspect-square w-full rounded-lg object-cover" />
          <img src="/images/products/p27.jpg" alt="Chunky gold hoops" width="900" height="1200" className="col-span-2 aspect-square w-full rounded-lg object-cover" />
        </div>
      </div>
    </section>
  );
}
