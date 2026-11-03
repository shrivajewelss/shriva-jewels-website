import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";

const SLIDES = [
  {
    id: 1,
    image: "/images/hero/hero-slide-1.jpg",
    alt: "Shriva Jewels handcrafted floral necklace, earrings, and statement ring",
    eyebrow: "The Festive Collection",
    title: "Pure Festive Radiance",
    subtitle: "Exquisite handcrafted jewellery crafted with timeless devotion, designed to make every celebration unforgettable.",
    ctaText: "EXPLORE JEWELRY",
    ctaLink: "/products",
    position: "object-[center_52%]",
  },
  {
    id: 2,
    image: "/images/hero/hero-slide-2.jpg",
    alt: "Model smiling and wearing Shriva Jewels layered necklaces, earrings, and bracelet",
    eyebrow: "Timeless Statement Pieces",
    title: "Jewellery That Speaks Your Style",
    subtitle: "Discover radiant pieces made to celebrate beauty, individuality, and every special moment.",
    ctaText: "EXPLORE JEWELRY",
    ctaLink: "/products",
    position: "object-[center_62%]",
  },
];

const DIWALI_MESSAGES = [
  "🪔 Shriva Jewels Wishes You a Blessed & Sparkling Diwali",
  "May the Festival of Lights Illuminate Your Days with Joy, Peace & Prosperity",
  "Adorn Every Sacred Moment with Timeless Handcrafted Radiance",
  "Celebrate Your Unique Beauty & Festive Spirit with Shriva Jewels",
  "Wishing You and Your Loved Ones a Joyous & Prosperous Happy Diwali 🪔",
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = useRef(null);
  const touchStartXRef = useRef(null);

  // Reliable automatic rotation timer (4.5s)
  const resetAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
  }, []);

  useEffect(() => {
    resetAutoplay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetAutoplay]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    resetAutoplay();
  }, [resetAutoplay]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    resetAutoplay();
  }, [resetAutoplay]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    resetAutoplay();
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (diff > 40) {
      nextSlide();
    } else if (diff < -40) {
      prevSlide();
    }
    touchStartXRef.current = null;
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      prevSlide();
    } else if (e.key === "ArrowRight") {
      nextSlide();
    }
  };

  return (
    <section
      className="relative w-full bg-stone-950 text-cream select-none focus:outline-none"
      aria-label="Hero Carousel"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* 
        Sized to fit comfortably within the screen viewport (header + banner + marquee = 100vh).
        Never overflows outside the screen.
      */}
      <div className="relative w-full h-[calc(100vh-106px)] sm:h-[calc(100vh-124px)] min-h-[340px] max-h-[660px] overflow-hidden">
        {SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
              aria-hidden={!isActive}
            >
              {/* Full Image Display with position tailored to keep all jewellery in frame */}
              <img
                src={slide.image}
                alt={slide.alt}
                width="1152"
                height="648"
                fetchPriority={index === 0 ? "high" : "auto"}
                loading={index === 0 ? "eager" : "lazy"}
                className={`w-full h-full object-cover ${slide.position} brightness-[1.04] contrast-[1.02]`}
              />

              {/* Soft gradient localized strictly to the bottom-left text area */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:bg-gradient-to-tr md:from-black/75 md:via-black/20 md:to-transparent"
                aria-hidden="true"
              />

              {/* Smaller font placed neatly in the BOTTOM LEFT corner */}
              <div className="absolute inset-0 z-20 flex items-end">
                <div className="container-page w-full pb-4 sm:pb-6 md:pb-8">
                  <div className="max-w-xs sm:max-w-sm md:max-w-md text-left pl-1 sm:pl-2">
                    <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-sand/90 mb-1">
                      {slide.eyebrow}
                    </p>
                    <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-light text-white tracking-tight leading-tight font-display drop-shadow-md">
                      {slide.title}
                    </h1>
                    <p className="mt-1 sm:mt-1.5 text-[11px] sm:text-xs md:text-sm text-cream/90 font-light leading-relaxed max-w-xs sm:max-w-sm drop-shadow">
                      {slide.subtitle}
                    </p>
                    <div className="mt-3 sm:mt-4">
                      <Link
                        to={slide.ctaLink}
                        className="inline-flex items-center justify-center rounded-full bg-white px-4 sm:px-6 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-ink hover:bg-sand transition-colors duration-200 shadow-md"
                      >
                        {slide.ctaText}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Slide Indicator Dots (Bottom Center) */}
        <div className="absolute bottom-2.5 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-white ${
                currentSlide === idx ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Diwali Festive Marquee Bar (No discounts, purely festive wishes) */}
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
