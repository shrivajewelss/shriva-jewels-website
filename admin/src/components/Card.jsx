export default function Card({ children, title, subtitle, action, className = "" }) {
  return (
    <div className={`rounded-xl border border-line bg-white shadow-card overflow-hidden ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/60 px-6 py-4">
          <div>
            {title && <h3 className="font-display text-xl text-ink font-semibold">{title}</h3>}
            {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
