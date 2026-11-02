import { Link } from "react-router-dom";
import { Sparkles, Heart, Gem, MessageCircle, ArrowRight } from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { BUSINESS_WHATSAPP_NUMBER } from "../utils/booking.js";

const founders = [
  {
    name: "Princy Dholu",
    title: "Co-Founder",
  },
  {
    name: "Dhrumi Mistry",
    title: "Co-Founder",
  },
  {
    name: "Aradhana Dholu",
    title: "Co-Founder",
  },
];

const pillars = [
  {
    icon: Heart,
    title: "Rooted in Friendship",
    text: "Shriva Jewels was born from genuine bond and trust. Every decision we make is guided by mutual respect and a shared dream.",
  },
  {
    icon: Gem,
    title: "Thoughtful Elegance",
    text: "Every piece in our catalogue is handpicked for quality, comfort, and timeless beauty—made to celebrate individuality every day.",
  },
  {
    icon: MessageCircle,
    title: "Personal Care",
    text: "We believe jewellery shopping should feel intimate. We connect with every customer directly on WhatsApp to confirm each request.",
  },
];

export default function AboutPage() {
  usePageMeta({
    title: "About Us — Three Friends, One Dream | Shriva Jewels",
    description:
      "Meet Princy Dholu, Dhrumi Mistry, and Aradhana Dholu—the three friends behind Shriva Jewels, curating jewellery that celebrates beauty and individuality.",
    path: "/about",
  });

  return (
    <div className="bg-cream">
      {/* Hero Header Banner */}
      <section className="border-b border-line bg-sand/40 py-14 sm:py-20">
        <div className="container-page max-w-3xl text-center">
          <p className="eyebrow tracking-[0.25em] text-maroon">SHRIVA JEWELS</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl lg:text-6xl text-maroon">
            Three Friends, One Dream
          </h1>
          <div className="mx-auto mt-5 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-amber-400" />
            <span className="h-1.5 w-1.5 rotate-45 bg-amber-500" />
            <span className="h-px w-12 bg-amber-400" />
          </div>
          <p className="mx-auto mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-ink/80">
            A journey born from friendship, creativity, and a shared passion for timeless jewellery that speaks your style.
          </p>
        </div>
      </section>

      {/* Founders Presentation */}
      <section className="container-page max-w-4xl pt-12 sm:pt-16">
        <div className="grid gap-5 sm:grid-cols-3">
          {founders.map((founder) => (
            <div
              key={founder.name}
              className="group rounded-2xl border border-amber-200/70 bg-white/80 p-6 text-center shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-md"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sand text-maroon transition-colors group-hover:bg-maroon group-hover:text-cream">
                <Sparkles size={18} strokeWidth={1.5} aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-semibold text-maroon">
                {founder.name}
              </h3>
              <p className="mt-1 font-sans text-xs uppercase tracking-[0.2em] text-muted">
                {founder.title}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Editorial Story Section */}
      <section className="container-page max-w-3xl py-12 sm:py-16">
        <div className="rounded-3xl border border-amber-200/60 bg-white/70 p-8 sm:p-12 shadow-sm space-y-8">
          <div>
            <p className="eyebrow tracking-[0.25em] text-maroon font-semibold">
              OUR STORY
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl text-maroon">
              Crafted With Meaning &amp; Passion
            </h2>
            <div className="mt-4 flex items-center gap-3">
              <span className="h-px w-12 bg-amber-400" />
              <span className="h-1.5 w-1.5 rotate-45 bg-amber-500" />
              <span className="h-px w-20 bg-amber-200" />
            </div>
          </div>

          {/* Verbatim Story Paragraphs */}
          <div className="space-y-6 font-sans text-base sm:text-lg leading-relaxed text-ink/85">
            <p>
              We are three friends who turned our shared passion into something meaningful.
              What started with a friendship and a dream grew into{" "}
              <strong className="font-semibold text-maroon">Shriva Jewels</strong>—a brand
              created to celebrate beauty, individuality, and the little details that make every moment special.
            </p>

            <p>
              As the founders of Shriva Jewels, we bring together creativity, trust, and dedication
              to curate jewellery that helps every woman express her unique style. Every piece we
              share reflects our love for elegance, thoughtful details, and timeless beauty.
            </p>

            <blockquote className="border-l-2 border-maroon/60 pl-6 font-serif italic text-lg sm:text-xl text-maroon leading-relaxed bg-sand/30 py-4 rounded-r-xl">
              &ldquo;This is more than a business to us; it&apos;s a journey we are building together,
              one beautiful piece at a time.&rdquo;
            </blockquote>
          </div>

          {/* Signature Block */}
          <div className="pt-4 border-t border-line/60">
            <p className="font-serif italic text-base text-maroon">
              With love,
            </p>
            <p className="mt-1 font-display text-lg font-medium text-ink">
              Princy Dholu, Dhrumi Mistry &amp; Aradhana Dholu
            </p>
            <p className="text-xs uppercase tracking-widest text-muted">
              Co-Founders, Shriva Jewels
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/products" className="btn btn-primary inline-flex items-center gap-2">
              <span>Explore Our Collection</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a
              href={`https://wa.me/${BUSINESS_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline inline-flex items-center gap-2"
            >
              <MessageCircle size={16} strokeWidth={1.5} aria-hidden="true" />
              <span>Say Hello on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* Brand Values / Pillars Section */}
      <section className="border-t border-line bg-sand/30 py-16 sm:py-20">
        <div className="container-page">
          <div className="text-center">
            <p className="eyebrow text-maroon">WHAT WE STAND FOR</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl text-maroon">
              Crafted With Passion &amp; Heart
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
              Every design, packaging touch, and conversation carries our personal commitment to you.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="group relative rounded-xl border border-line bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand text-maroon transition-colors group-hover:bg-maroon group-hover:text-cream">
                  <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-display text-2xl text-maroon">{title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
