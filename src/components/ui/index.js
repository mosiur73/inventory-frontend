"use client";

// ── Stat Card ──────────────────────────────────────────────────
export function StatCard({ title, value, icon: Icon, color = "blue", subtitle }) {
  const colors = {
    blue:   { bg: "bg-blue-50",   icon: "bg-blue-100",   text: "text-blue-600"   },
    green:  { bg: "bg-green-50",  icon: "bg-green-100",  text: "text-green-600"  },
    amber:  { bg: "bg-amber-50",  icon: "bg-amber-100",  text: "text-amber-600"  },
    red:    { bg: "bg-red-50",    icon: "bg-red-100",    text: "text-red-600"    },
    purple: { bg: "bg-purple-50", icon: "bg-purple-100", text: "text-purple-600" },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`${c.bg} rounded-xl p-5 border border-white`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 ${c.icon} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${c.text}`} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────
export function Badge({ label, color = "gray" }) {
  const colors = {
    gray:   "bg-gray-100 text-gray-600",
    green:  "bg-green-100 text-green-700",
    blue:   "bg-blue-100 text-blue-700",
    amber:  "bg-amber-100 text-amber-700",
    red:    "bg-red-100 text-red-700",
    purple: "bg-purple-100 text-purple-700",
    cyan:   "bg-cyan-100 text-cyan-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.gray}`}>
      {label}
    </span>
  );
}

// ── Status Badge ───────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    Pending:    { color: "amber",  label: "Pending"    },
    Confirmed:  { color: "blue",   label: "Confirmed"  },
    Shipped:    { color: "purple", label: "Shipped"    },
    Delivered:  { color: "green",  label: "Delivered"  },
    Cancelled:  { color: "red",    label: "Cancelled"  },
    Active:     { color: "green",  label: "Active"     },
    "Out of Stock": { color: "red", label: "Out of Stock" },
    High:       { color: "red",    label: "High"       },
    Medium:     { color: "amber",  label: "Medium"     },
    Low:        { color: "green",  label: "Low"        },
  };
  const s = map[status] || { color: "gray", label: status };
  return <Badge label={s.label} color={s.color} />;
}

// ── Spinner ────────────────────────────────────────────────────
export function Spinner({ size = "md" }) {
  const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className={`${sizes[size]} border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
  );
}

// ── Page Loader ────────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────
export function EmptyState({ message = "No data found", icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      {Icon && <Icon className="w-12 h-12 mb-3 opacity-30" />}
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Confirm Dialog ─────────────────────────────────────────────
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirm", danger = false }) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-600 text-sm mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white ${danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ── Input ──────────────────────────────────────────────────────
export function Input({ label, error, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <input
        {...props}
        className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
          ${error ? "border-red-300 bg-red-50" : "border-gray-300"} ${props.className || ""}`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Select ─────────────────────────────────────────────────────
export function Select({ label, error, children, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <select
        {...props}
        className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white
          ${error ? "border-red-300" : "border-gray-300"} ${props.className || ""}`}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Button ─────────────────────────────────────────────────────
export function Button({ children, variant = "primary", size = "md", loading, icon: Icon, ...props }) {
  const variants = {
    primary:   "bg-blue-600 hover:bg-blue-700 text-white border-transparent",
    secondary: "bg-white hover:bg-gray-50 text-gray-700 border-gray-300",
    danger:    "bg-red-600 hover:bg-red-700 text-white border-transparent",
    success:   "bg-green-600 hover:bg-green-700 text-white border-transparent",
    ghost:     "bg-transparent hover:bg-gray-100 text-gray-600 border-transparent",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
  };
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg border transition disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${props.className || ""}`}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
}

// ── Pagination ─────────────────────────────────────────────────
export function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
      <span>Showing {from}–{to} of {total}</span>
      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition"
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
            acc.push(p);
            return acc;
          }, [])
          .map((p, idx) =>
            p === "..." ? (
              <span key={`dots-${idx}`} className="px-2 py-1.5">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  p === page ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            )
          )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}
