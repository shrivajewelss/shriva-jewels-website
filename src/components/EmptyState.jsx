export default function EmptyState({ title, children }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h2 className="text-3xl">{title}</h2>
      <div className="mt-3 text-sm text-muted">{children}</div>
    </div>
  );
}
