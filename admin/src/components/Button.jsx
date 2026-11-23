export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  className = "",
  icon: Icon,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center font-medium transition-all rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon/20 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-maroon text-cream hover:bg-maroon-deep shadow-sm",
    secondary: "bg-sand text-ink hover:bg-line border border-line",
    outline: "border border-line bg-white text-ink hover:border-maroon hover:text-maroon shadow-sm",
    danger: "bg-red-700 text-white hover:bg-red-800 shadow-sm",
    ghost: "text-muted hover:text-maroon hover:bg-sand/40",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2.5",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : Icon ? (
        <Icon size={size === "sm" ? 14 : size === "lg" ? 18 : 16} className="shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
