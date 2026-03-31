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
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Package2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">Inventory</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-blue-600" : "text-gray-400"}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-400 capitalize">{userRole}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
