export default function LoadingState({ label = "Loading…" }) {
  return <p className="py-16 text-center text-sm text-muted" role="status">{label}</p>;
}
