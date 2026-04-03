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
    <header className="bg-white border-b border-gray-100 px-4 lg:px-8 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-600"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block pr-2 border-r border-gray-200">
          <p className="text-sm font-semibold text-gray-900">{userName}</p>
          <p className="text-xs text-gray-500 capitalize mt-0.5">{userRole}</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-200">
          <span className="text-white font-bold text-sm">{initial}</span>
        </div>
      </div>
    </header>
  );
}