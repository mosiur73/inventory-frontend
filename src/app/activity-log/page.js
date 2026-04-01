"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button, PageLoader, EmptyState, Pagination } from "@/components/ui";
import activityLogService from "@/services/activityLog.service";
import { ClipboardList, RefreshCw, Package, ShoppingCart, RefreshCwIcon, Tag, User } from "lucide-react";

const entityIcon = (entity) => {
  const map = {
    Order:    { icon: ShoppingCart, bg: "bg-blue-100",   color: "text-blue-600"   },
    Product:  { icon: Package,      bg: "bg-indigo-100", color: "text-indigo-600" },
    Restock:  { icon: RefreshCwIcon,bg: "bg-amber-100",  color: "text-amber-600"  },
    Category: { icon: Tag,          bg: "bg-green-100",  color: "text-green-600"  },
    Auth:     { icon: User,         bg: "bg-purple-100", color: "text-purple-600" },
  };
  return map[entity] || { icon: ClipboardList, bg: "bg-gray-100", color: "text-gray-500" };
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export default function ActivityLogPage() {
  const [logs, setLogs]           = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await activityLogService.getLogs({ page, limit: 15 });
      setLogs(res.data?.logs || []);
      setPagination(res.data?.pagination || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Activity Log</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {pagination?.total ?? 0} total system actions
            </p>
          </div>
          <Button variant="ghost" icon={RefreshCw} onClick={fetchLogs}>Refresh</Button>
        </div>

        {/* Log List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? <PageLoader /> : logs.length === 0 ? (
            <EmptyState message="No activity recorded yet" icon={ClipboardList} />
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {logs.map((log, idx) => {
                  const { icon: Icon, bg, color } = entityIcon(log.entity);
                  return (
                    <div key={log._id || idx} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition">
                      {/* Icon */}
                      <div className={`w-9 h-9 ${bg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{log.action}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {log.performedBy && (
                            <span className="text-xs text-gray-400">
                              by <span className="font-medium text-gray-500">
                                {log.performedBy?.name || "System"}
                              </span>
                            </span>
                          )}
                          <span className="text-xs text-gray-300">•</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            log.entity === "Order"    ? "bg-blue-50 text-blue-500"   :
                            log.entity === "Product"  ? "bg-indigo-50 text-indigo-500":
                            log.entity === "Restock"  ? "bg-amber-50 text-amber-500" :
                            log.entity === "Category" ? "bg-green-50 text-green-500" :
                            "bg-gray-50 text-gray-400"
                          }`}>
                            {log.entity}
                          </span>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400">{timeAgo(log.createdAt)}</p>
                        <p className="text-xs text-gray-300 mt-0.5">
                          {new Date(log.createdAt).toLocaleTimeString([], {
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-5 pb-4 border-t border-gray-100">
                <Pagination pagination={pagination} onPageChange={setPage} />
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
