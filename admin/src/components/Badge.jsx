export default function Badge({ children, variant = "default", size = "sm" }) {
  const variants = {
    default: "bg-sand/70 text-ink border-line",
    maroon: "bg-maroon text-cream border-maroon",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    blue: "bg-blue-50 text-blue-800 border-blue-200",
    indigo: "bg-indigo-50 text-indigo-800 border-indigo-200",
    purple: "bg-purple-50 text-purple-800 border-purple-200",
    red: "bg-red-50 text-red-800 border-red-200",
    gray: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const sizes = {
    xs: "px-2 py-0.5 text-[10px]",
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variants[variant] || variants.default} ${
        sizes[size] || sizes.sm
      }`}
    >
      {children}
    </span>
  );
}
