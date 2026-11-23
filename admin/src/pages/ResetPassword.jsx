import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { requestPasswordReset } from "../services/auth.js";
import Button from "../components/Button.jsx";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setError(null);
    setLoading(true);

    const { error: resetErr } = await requestPasswordReset(email);
    if (resetErr) {
      setError(resetErr.message || "Failed to send reset email.");
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-line bg-white p-8 sm:p-10 shadow-2xl">
        <div className="text-center">
          <img
            src="https://www.shriva.store/brand/shriva-logo.png"
            alt="Shriva Jewels"
            className="mx-auto h-14 w-auto"
          />
          <h1 className="mt-4 font-display text-3xl font-semibold text-ink">
            Reset Password
          </h1>
          <p className="mt-1 text-xs text-muted">
            Enter your authorized admin email to receive a secure recovery link.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center space-y-3">
            <CheckCircle2 size={36} className="mx-auto text-emerald-700" />
            <h3 className="font-semibold text-emerald-900 text-sm">Recovery Link Sent</h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              If an authorized account is registered for <span className="font-semibold">{email}</span>, a password reset link has been dispatched.
            </p>
            <Link to="/login" className="inline-block mt-4 text-xs font-semibold text-maroon hover:underline">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                <AlertCircle size={16} className="text-red-700 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="reset-email" className="block text-xs font-medium uppercase tracking-wider text-muted mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@shriva.store"
                  className="w-full rounded-xl border border-line bg-cream/30 pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-maroon focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full h-11 text-sm font-semibold">
              Send Password Reset Link
            </Button>

            <div className="text-center">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-maroon transition-colors">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
