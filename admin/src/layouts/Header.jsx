import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, ExternalLink, Bell, User, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";

export default function Header({ onOpenSidebar }) {
  const { profile, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  // Generate breadcrumbs from path
  const pathParts = location.pathname.split("/").filter(Boolean);
  const breadcrumbTitle = pathParts[0]
    ? pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1).replace("-", " ")
    : "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-16 sm:h-20 items-center justify-between border-b border-line bg-cream/90 px-4 sm:px-8 backdrop-blur">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-maroon hover:bg-sand/60 lg:hidden"
          aria-label="Open sidebar navigation"
        >
          <Menu size={22} />
        </button>

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-muted">
          <Link to="/" className="hover:text-maroon transition-colors">
            Shriva Admin
          </Link>
          <ChevronRight size={14} className="text-muted/60" />
          <span className="font-medium text-ink truncate">{breadcrumbTitle}</span>
        </nav>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Link to live storefront */}
        <a
          href="https://www.shriva.store"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink hover:border-maroon hover:text-maroon transition-colors shadow-sm"
        >
          <ExternalLink size={14} />
          <span>View Storefront</span>
        </a>

        {/* Notifications Icon */}
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-muted hover:text-maroon hover:border-maroon transition-colors shadow-sm"
          aria-label="Notifications"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-maroon" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-full border border-line bg-white p-1 pr-3 hover:border-maroon transition-colors shadow-sm"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-maroon text-xs font-bold text-cream">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "A"}
            </div>
            <span className="hidden md:inline text-xs font-medium text-ink max-w-[120px] truncate">
              {profile?.full_name || "Admin"}
            </span>
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-xl border border-line bg-white py-2 shadow-2xl z-50 text-xs"
              onClick={() => setProfileOpen(false)}
            >
              <div className="px-4 py-2 border-b border-line/60">
                <p className="font-semibold text-ink truncate">{profile?.full_name || "Admin"}</p>
                <p className="text-[10px] text-muted truncate">Authorized Account</p>
              </div>
              <Link
                to="/settings"
                className="flex items-center gap-2 px-4 py-2 text-ink hover:bg-sand/40 hover:text-maroon transition-colors"
              >
                <User size={14} /> Account Settings
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-red-700 hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
