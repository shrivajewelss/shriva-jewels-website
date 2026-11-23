export default function StatsCard({ title, value, subtitle, icon: Icon, trend = null, color = "maroon" }) {
  const iconBg = {
    maroon: "bg-maroon-surface text-maroon border-maroon/20",
    gold: "bg-gold-light text-gold-muted border-gold-muted/30",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
    blue: "bg-blue-50 text-blue-800 border-blue-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
  };

  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-card hover:shadow-luxury transition-all">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted uppercase tracking-wider">{title}</p>
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${iconBg[color] || iconBg.maroon}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="font-display text-3xl font-semibold text-ink">{value}</p>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend > 0 ? "text-emerald-700" : trend < 0 ? "text-red-700" : "text-muted"
            }`}
          >
            {trend > 0 ? `+${trend}%` : `${trend}%`}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
    </div>
  );
}
