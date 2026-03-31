"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { StatCard, PageLoader, StatusBadge } from "@/components/ui";
import dashboardService from "@/services/dashboard.service";
import {
  ShoppingCart, Package, AlertTriangle,
  DollarSign, TrendingUp, CheckCircle,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await dashboardService.getStats();
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

  const { summary, ordersByStatus, productSummary, last7DaysRevenue } = stats || {};

  // Format chart data
  const chartData = last7DaysRevenue?.map((d) => ({
    date: new Date(d._id).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    revenue: d.revenue,
    orders: d.orders,
  })) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Orders Today"
            value={summary?.totalOrdersToday ?? 0}
            icon={ShoppingCart}
            color="blue"
            subtitle="Total orders placed today"
          />
          <StatCard
            title="Pending Orders"
            value={summary?.pendingOrders ?? 0}
            icon={TrendingUp}
            color="amber"
            subtitle="Awaiting confirmation"
          />
          <StatCard
            title="Completed Orders"
            value={summary?.completedOrders ?? 0}
            icon={CheckCircle}
            color="green"
            subtitle="Successfully delivered"
          />
          <StatCard
            title="Revenue Today"
            value={`$${(summary?.revenueToday ?? 0).toFixed(2)}`}
            icon={DollarSign}
            color="purple"
            subtitle="Non-cancelled orders"
          />
        </div>

        {/* Low Stock Alert */}
        {summary?.lowStockItemsCount > 0 && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              <span className="font-semibold">{summary.lowStockItemsCount} product(s)</span> are below minimum stock threshold and need restocking.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Revenue Chart */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Revenue — Last 7 Days</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v) => [`$${v}`, "Revenue"]} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-gray-400 text-sm">
                No revenue data for the last 7 days
              </div>
            )}
          </div>

          {/* Orders by Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Orders by Status</h2>
            <div className="space-y-3">
              {ordersByStatus && Object.keys(ordersByStatus).length > 0 ? (
                Object.entries(ordersByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <StatusBadge status={status} />
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">No orders yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Product Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Product Stock Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {productSummary?.length > 0 ? (
                  productSummary.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="py-3 px-3 font-medium text-gray-900">{p.name}</td>
                      <td className="py-3 px-3 text-gray-500">{p.category || "—"}</td>
                      <td className="py-3 px-3">
                        <span className={`font-semibold ${p.stock === 0 ? "text-red-500" : p.stockStatus === "Low Stock" ? "text-amber-500" : "text-green-600"}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          p.stockStatus === "Out of Stock" ? "bg-red-100 text-red-600" :
                          p.stockStatus === "Low Stock"   ? "bg-amber-100 text-amber-600" :
                          "bg-green-100 text-green-600"
                        }`}>
                          {p.stockStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">No products found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
