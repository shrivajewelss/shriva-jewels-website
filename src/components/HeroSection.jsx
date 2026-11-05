import HeroCarousel, { HERO_SLIDES } from "./HeroCarousel.jsx";

const DIWALI_MESSAGES = [
  "🪔 Shriva Jewels Wishes You a Blessed & Sparkling Diwali",
  "May the Festival of Lights Illuminate Your Days with Joy, Peace & Prosperity",
  "Adorn Every Sacred Moment with Timeless Handcrafted Radiance",
  "Celebrate Your Unique Beauty & Festive Spirit with Shriva Jewels",
  "Wishing You and Your Loved Ones a Joyous & Prosperous Happy Diwali 🪔",
];

export default function HeroSection() {
  return (
    <section className="relative w-full bg-stone-950 text-cream" aria-label="Hero Section">
      {/* Full-width, Tanishq-inspired Hero Carousel */}
      <HeroCarousel slides={HERO_SLIDES} autoplayInterval={5000} />

      {/* Diwali Festive Marquee Bar */}
      <div
        className="w-full bg-[#1b0a05] text-[#f4e8dc] border-y border-[#3d160c] overflow-hidden py-2.5 sm:py-3 text-xs sm:text-sm tracking-widest uppercase font-medium"
        role="region"
        aria-label="Diwali festive greetings marquee"
      >
        <div className="animate-marquee whitespace-nowrap flex items-center">
          {/* First sequence */}
          <div className="flex items-center shrink-0">
            {DIWALI_MESSAGES.map((msg, i) => (
              <span key={`a-${i}`} className="inline-flex items-center mx-4 sm:mx-6">
                <span>{msg}</span>
                <span className="ml-4 sm:ml-6 text-sand/50" aria-hidden="true">✦</span>
              </span>
            ))}
          </div>
          {/* Second identical sequence for seamless continuous loop */}
          <div className="flex items-center shrink-0" aria-hidden="true">
            {DIWALI_MESSAGES.map((msg, i) => (
              <span key={`b-${i}`} className="inline-flex items-center mx-4 sm:mx-6">
                <span>{msg}</span>
                <span className="ml-4 sm:ml-6 text-sand/50" aria-hidden="true">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
