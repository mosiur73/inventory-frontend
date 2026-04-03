"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Package, Tag, ShoppingCart,
  RefreshCw, ClipboardList, LogOut, Package2, X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/products",     label: "Products",     icon: Package         },
  { href: "/categories",   label: "Categories",   icon: Tag             },
  { href: "/orders",       label: "Orders",       icon: ShoppingCart    },
  { href: "/restock",      label: "Restock Queue",icon: RefreshCw       },
  { href: "/activity-log", label: "Activity Log", icon: ClipboardList   },
];

export default function Sidebar({ onClose }) {
  const pathname  = usePathname();
  const { user, logout } = useAuth();

  // ✅ Hydration fix: only render user-specific content after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const initial = mounted ? (user?.name?.charAt(0)?.toUpperCase() ?? "U") : "U";
  const userName = mounted ? (user?.name ?? "") : "";
  const userRole = mounted ? (user?.role ?? "") : "";

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 w-64">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Package2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-lg block">Inventory</span>
            <span className="text-xs text-slate-400">Manager</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${active ? "text-blue-400" : "text-slate-500"}`} />
              <span className="flex-1">{label}</span>
              {active && <div className="w-2 h-2 bg-blue-400 rounded-full"></div>}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 px-3 py-3 mb-3 rounded-lg bg-slate-700/30">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-white text-sm">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-100 truncate">{userName}</p>
            <p className="text-xs text-slate-500 capitalize">{userRole}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}