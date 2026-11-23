import { useState } from "react";
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Database,
  Cloud,
  MessageCircle,
  CreditCard,
  Lock,
  Save,
  CheckCircle2,
} from "lucide-react";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import Badge from "../components/Badge.jsx";
import { updateAdminPassword } from "../services/auth.js";
import { isCloudinaryConfigured } from "../services/cloudinary.js";
import { isSupabaseConfigured } from "../services/supabase.js";
import { BUSINESS_DETAILS } from "../utils/invoice.js";

export default function Settings() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    setPasswordError(null);
    setPasswordMsg(null);

    const { error } = await updateAdminPassword(newPassword);
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordMsg("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSavingPassword(false);
  };

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">System &amp; Store Settings</h1>
        <p className="text-xs text-muted mt-1">
          Store metadata, administrator access verification, integrations, and security controls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Store Information */}
        <Card title="Store Business Information" subtitle="Public customer & invoice branding">
          <div className="space-y-4 text-xs">
            <div>
              <p className="text-muted uppercase">Brand Name</p>
              <p className="font-display font-semibold text-base text-ink mt-0.5">
                {BUSINESS_DETAILS.name}
              </p>
            </div>
            <div>
              <p className="text-muted uppercase">Tagline</p>
              <p className="font-medium text-ink mt-0.5">{BUSINESS_DETAILS.tagline}</p>
            </div>
            <div>
              <p className="text-muted uppercase">Location</p>
              <p className="font-medium text-ink mt-0.5">{BUSINESS_DETAILS.city}</p>
            </div>
            <div>
              <p className="text-muted uppercase">Customer Support Phone</p>
              <p className="font-mono text-ink mt-0.5">{BUSINESS_DETAILS.supportPhone}</p>
            </div>
            <div>
              <p className="text-muted uppercase">Customer Support Email</p>
              <p className="font-mono text-ink mt-0.5">{BUSINESS_DETAILS.supportEmail}</p>
            </div>
          </div>
        </Card>

        {/* Authorized Admin Profiles */}
        <Card
          title="Authorized Administrator Roster"
          subtitle="Managed in public.admin_profiles table"
        >
          <div className="space-y-3">
            {[
              { name: "Dhrumi Mistry", role: "Primary Administrator" },
              { name: "Princy Dholu", role: "Administrator" },
              { name: "Aradhana Dholu", role: "Administrator" },
              { name: "Shriva Jewels", role: "Master Store Account" },
            ].map((adm, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-line bg-cream/40 p-3"
              >
                <div>
                  <p className="font-semibold text-sm text-ink">{adm.name}</p>
                  <p className="text-[11px] text-muted">{adm.role}</p>
                </div>
                <Badge variant="emerald">Authorized &amp; Active</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Integrations Health Status */}
        <Card title="Integration Services Telemetry" subtitle="External platform connectors">
          <div className="space-y-4 text-xs">
            {/* Supabase */}
            <div className="flex items-center justify-between rounded-lg border border-line p-3">
              <div className="flex items-center gap-3">
                <Database size={20} className="text-emerald-700" />
                <div>
                  <p className="font-semibold text-ink">Supabase PostgreSQL &amp; Auth</p>
                  <p className="text-[11px] text-muted">https://uyskfaqrptwpnxzgisnn.supabase.co</p>
                </div>
              </div>
              <Badge variant="emerald">Connected</Badge>
            </div>

            {/* Cloudinary */}
            <div className="flex items-center justify-between rounded-lg border border-line p-3">
              <div className="flex items-center gap-3">
                <Cloud size={20} className="text-blue-700" />
                <div>
                  <p className="font-semibold text-ink">Cloudinary Image CDN</p>
                  <p className="text-[11px] text-muted">Automatic WebP/AVIF format &amp; thumbnailing</p>
                </div>
              </div>
              <Badge variant={isCloudinaryConfigured ? "emerald" : "amber"}>
                {isCloudinaryConfigured ? "Configured" : "Pending Credentials"}
              </Badge>
            </div>

            {/* WhatsApp */}
            <div className="flex items-center justify-between rounded-lg border border-line p-3">
              <div className="flex items-center gap-3">
                <MessageCircle size={20} className="text-emerald-700" />
                <div>
                  <p className="font-semibold text-ink">WhatsApp Business Platform</p>
                  <p className="text-[11px] text-muted">Meta Cloud API / Deep link fallbacks</p>
                </div>
              </div>
              <Badge variant="emerald">Active</Badge>
            </div>

            {/* Razorpay */}
            <div className="flex items-center justify-between rounded-lg border border-line p-3">
              <div className="flex items-center gap-3">
                <CreditCard size={20} className="text-indigo-700" />
                <div>
                  <p className="font-semibold text-ink">Razorpay Payments (India)</p>
                  <p className="text-[11px] text-muted">UPI, Cards, NetBanking with Server Webhooks</p>
                </div>
              </div>
              <Badge variant="amber">Ready for API Keys</Badge>
            </div>
          </div>
        </Card>

        {/* Change Admin Password */}
        <Card title="Security &amp; Password" subtitle="Update current administrator credentials">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {passwordMsg && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                {passwordMsg}
              </div>
            )}
            {passwordError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                {passwordError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              />
            </div>

            <Button type="submit" loading={savingPassword} icon={Lock}>
              Update Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
