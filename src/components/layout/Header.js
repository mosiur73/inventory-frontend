"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

export default function Header({ onMenuClick, title }) {
  const { user } = useAuth();

  // ✅ Hydration fix
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const initial  = mounted ? (user?.name?.charAt(0)?.toUpperCase() ?? "U") : "U";
  const userName = mounted ? (user?.name ?? "") : "";
  const userRole = mounted ? (user?.role ?? "") : "";

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-gray-700"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-900">{userName}</p>
          <p className="text-xs text-gray-400 capitalize">{userRole}</p>
        </div>
        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-semibold text-sm">{initial}</span>
        </div>
      </div>
    </header>
  );
}
