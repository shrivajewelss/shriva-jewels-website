import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

/**
 * 4 Promotional Campaign Slides inspired by Tanishq's premium jewellery hero experience,
 * tailored to Shriva Jewels' cream, gold, and terracotta brand identity.
 */
export const HERO_SLIDES = [
  {
    id: "everyday-elegance",
    image: "/images/hero/hero-slide-3.jpg",
    alt: "Shriva Jewels Elegant Everyday Jewellery Collection - delicate gold necklace and earrings",
    eyebrow: "Everyday Luxury",
    title: "Elegance in Every Detail",
    subtitle: "Discover jewellery that makes every moment special.",
    ctaText: "Explore Collection",
    ctaLink: "/products",
    imagePosition: "object-[center_35%]",
    overlayGradient:
      "bg-gradient-to-t from-black/85 via-black/40 to-transparent sm:bg-gradient-to-r sm:from-black/75 sm:via-black/35 sm:to-transparent",
  },
  {
    id: "timeless-gold",
    image: "/images/hero/hero-slide-2.jpg",
    alt: "Shriva Jewels Timeless Gold Collection - radiant gold necklace, earrings and rings",
    eyebrow: "Heritage Craftsmanship",
    title: "A Touch of Timeless Luxury",
    subtitle: "Celebrate the beauty of timeless craftsmanship.",
    ctaText: "Shop Gold",
    ctaLink: "/products",
    imagePosition: "object-[center_58%]",
    overlayGradient:
      "bg-gradient-to-t from-[#1b0905]/85 via-[#1b0905]/40 to-transparent sm:bg-gradient-to-r sm:from-[#1b0905]/80 sm:via-[#1b0905]/35 sm:to-transparent",
  },
  {
    id: "floral-collection",
    image: "/images/hero/hero-slide-1.jpg",
    alt: "Shriva Jewels Floral Jewellery Collection - handcrafted floral necklace and cocktail ring",
    eyebrow: "Nature Inspired",
    title: "Beauty That Blooms Forever",
    subtitle: "Discover designs inspired by nature and elegance.",
    ctaText: "Discover More",
    ctaLink: "/products",
    imagePosition: "object-[center_50%]",
    overlayGradient:
      "bg-gradient-to-t from-black/85 via-black/40 to-transparent sm:bg-gradient-to-r sm:from-black/75 sm:via-black/35 sm:to-transparent",
  },
  {
    id: "signature-collection",
    image: "/images/hero/hero-slide-4.jpg",
    alt: "Shriva Jewels Signature Collection - high jewellery statement collar and chandelier earrings",
    eyebrow: "Haute Joaillerie",
    title: "Designed to Make You Shine",
    subtitle: "Find the perfect piece that reflects your personality.",
    ctaText: "Shop Now",
    ctaLink: "/products",
    imagePosition: "object-[center_40%]",
    overlayGradient:
      "bg-gradient-to-t from-[#200705]/90 via-[#200705]/45 to-transparent sm:bg-gradient-to-r sm:from-[#200705]/85 sm:via-[#200705]/40 sm:to-transparent",
  },
];

export default function HeroCarousel({
  slides = HERO_SLIDES,
  autoplayInterval = 5000,
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  // Autoplay effect with pause on hover / interaction
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, autoplayInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide, autoplayInterval, totalSlides]);

  // Touch swipe gestures for mobile
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const deltaX = touchStartXRef.current - e.changedTouches[0].clientX;
    const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;

    // Detect horizontal swipe if deltaX exceeds threshold and is larger than vertical scrolling
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlide();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-stone-950 text-cream select-none focus:outline-none"
      role="region"
      aria-roledescription="carousel"
      aria-label="Shriva Jewels campaign highlights"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* 
        Responsive height:
        - Mobile: 500px min-height to ensure jewellery and model remain clearly in view.
        - Tablet: 580px
        - Desktop: 660px to 740px max-height (fits cleanly within viewport with header).
      */}
      <div className="relative w-full h-[500px] sm:h-[580px] md:h-[640px] lg:h-[700px] xl:h-[740px] max-h-[82vh]">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive
                  ? "opacity-100 z-10 pointer-events-auto"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${totalSlides}: ${slide.title}`}
              aria-hidden={!isActive}
            >
              {/* Campaign Image */}
              <img
                src={`https://shriva-jewels.vercel.app${slide.image}`}
                alt={slide.alt}
                width="1600"
                height="900"
                fetchPriority={index === 0 ? "high" : "auto"}
                loading={index === 0 ? "eager" : "lazy"}
                className={`w-full h-full object-cover ${slide.imagePosition} transition-transform duration-1000 ease-out ${
                  isActive ? "scale-100" : "scale-105"
                } brightness-[1.03] contrast-[1.02]`}
              />

              {/* Directional gradient overlay for text readability without washing out jewellery */}
              <div
                className={`absolute inset-0 ${slide.overlayGradient}`}
                aria-hidden="true"
              />

              {/* Text Overlay & Call To Action */}
              <div className="absolute inset-0 z-20 flex items-end sm:items-center">
                <div className="container-page w-full pb-14 sm:pb-0">
                  <div className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl text-left pl-1 sm:pl-2">
                    {/* Eyebrow / Campaign Tag */}
                    <p className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#e8c89b] mb-2 sm:mb-3 drop-shadow">
                      <span className="w-4 h-px bg-[#e8c89b]" aria-hidden="true" />
                      <span>{slide.eyebrow}</span>
                    </p>

                    {/* Heading */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-white tracking-tight leading-[1.15] font-display drop-shadow-lg">
                      {slide.title}
                    </h1>

                    {/* Subtitle */}
                    <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-cream/90 font-light leading-relaxed max-w-xs sm:max-w-md drop-shadow">
                      {slide.subtitle}
                    </p>

                    {/* CTA Button */}
                    <div className="mt-4 sm:mt-6">
                      <Link
                        to={slide.ctaLink}
                        className="group inline-flex items-center gap-2 rounded-full bg-cream px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-medium tracking-widest uppercase text-maroon hover:bg-white hover:text-maroon-deep transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <span>{slide.ctaText}</span>
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-maroon transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Previous Navigation Arrow */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous campaign slide"
          className="absolute left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-black/30 hover:bg-black/60 text-white/90 hover:text-white border border-white/20 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-cream"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Next Navigation Arrow */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next campaign slide"
          className="absolute right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-black/30 hover:bg-black/60 text-white/90 hover:text-white border border-white/20 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-cream"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Minimal Slide Indicator Dots / Progress (Bottom Center) */}
        <div
          className="absolute bottom-4 sm:bottom-6 md:bottom-7 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-2.5"
          role="tablist"
          aria-label="Slide indicators"
        >
          {slides.map((slide, idx) => {
            const isActive = idx === currentSlide;
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                onClick={() => goToSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream ${
                  isActive
                    ? "w-8 sm:w-10 bg-cream shadow-md"
                    : "w-2 sm:w-2.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

