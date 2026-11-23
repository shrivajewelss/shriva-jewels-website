import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";
import Button from "../components/Button.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError(null);
    setLoading(true);

    const res = await login({ email, password });
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-line bg-white p-8 sm:p-10 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <img
              src="https://www.shriva.store/brand/shriva-logo.png"
              alt="Shriva Jewels"
              className="mx-auto h-14 sm:h-16 w-auto"
            />
          </Link>
          <h1 className="mt-4 font-display text-3xl font-semibold text-ink">
            Admin Portal
          </h1>
          <p className="mt-1 text-xs text-muted">
            Management &amp; Inventory Suite · Shriva Jewels
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800"
            role="alert"
          >
            <AlertCircle size={18} className="shrink-0 text-red-700 mt-0.5" />
            <div>
              <p className="font-semibold">Authentication Error</p>
              <p className="mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-medium uppercase tracking-wider text-muted mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shriva.store"
                className="w-full rounded-xl border border-line bg-cream/30 pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-maroon focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="admin-password"
                className="block text-xs font-medium uppercase tracking-wider text-muted"
              >
                Password
              </label>
              <Link
                to="/reset-password"
                className="text-xs text-maroon hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-line bg-cream/30 pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-maroon focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full h-11 text-sm font-semibold shadow-md flex items-center justify-center gap-2"
          >
            <span>Sign in to Dashboard</span>
            <ArrowRight size={16} />
          </Button>
        </form>

        {/* Security Notice */}
        <div className="border-t border-line/60 pt-4 text-center">
          <p className="text-[11px] text-muted leading-relaxed">
            Authorized administrative access strictly limited to verified profiles:{" "}
            <span className="font-medium text-ink">
              Dhrumi Mistry, Princy Dholu, Aradhana Dholu, Shriva Jewels
            </span>
            . All activities are recorded.
          </p>
        </div>
      </div>
    </div>
  );
}
