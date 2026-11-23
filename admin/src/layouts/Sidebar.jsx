import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Gem,
  FolderTree,
  Boxes,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  Receipt,
  BarChart3,
  Activity,
  Settings,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";

export const NAVIGATION_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Gem },
  { to: "/categories", label: "Categories", icon: FolderTree },
  { to: "/inventory", label: "Inventory", icon: Boxes },
  { to: "/stock-batches", label: "Stock Batches", icon: Layers },
  { to: "/orders", label: "Orders", icon: ShoppingBag },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/offers", label: "Offers & Discounts", icon: Tag },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/reports", label: "Financial Reports", icon: BarChart3 },
  { to: "/activity", label: "Admin Activity", icon: Activity },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { profile, logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 sm:h-20 items-center justify-between border-b border-line px-6 bg-cream/30">
          <div className="flex items-center gap-3">
            <img
              src="https://www.shriva.store/brand/shriva-logo.png"
              alt="Shriva Jewels"
              className="h-9 w-auto"
            />
            <span className="font-display text-xl font-bold tracking-wide text-maroon">
              Admin
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-muted hover:text-maroon lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-maroon text-cream shadow-sm"
                      : "text-ink/80 hover:bg-sand/40 hover:text-maroon"
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Current Admin User Profile Footer */}
        <div className="border-t border-line bg-cream/40 p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink truncate">
                {profile?.full_name || "Administrator"}
              </p>
              <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 inline-block" />
                Active Admin
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Log out"
              className="rounded-lg p-2 text-muted hover:text-maroon hover:bg-sand/60 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
