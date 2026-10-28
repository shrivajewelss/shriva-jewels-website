import { Gem, Tag, MessageCircle, HandCoins } from "lucide-react";

const items = [
  { icon: Gem, title: "Curated designs", text: "Earrings, necklaces, rings, bracelets and anklets in one place." },
  { icon: Tag, title: "Clear pricing", text: "Every piece shows its code and price upfront." },
  { icon: MessageCircle, title: "Book on WhatsApp", text: "Send your bag as a booking request — no account needed." },
  { icon: HandCoins, title: "No online payment", text: "We confirm availability with you personally first." },
];

export default function BenefitsSection() {
  return (
    <section className="container-page pt-24" aria-labelledby="why-h">
      <p className="eyebrow text-center">Why Shriva Jewels</p>
      <h2 id="why-h" className="mt-2 text-center text-4xl sm:text-5xl">Simple, personal shopping</h2>
      <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sand text-maroon"><Icon size={24} strokeWidth={1.5} aria-hidden="true" /></span>
            <h3 className="mt-4 text-2xl">{title}</h3>
            <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-muted">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
