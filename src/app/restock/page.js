"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Button, PageLoader, EmptyState,
  StatusBadge, Pagination, Modal, Input, ConfirmDialog,
} from "@/components/ui";
import restockService from "@/services/restock.service";
import { RefreshCw, Plus, Trash2, AlertTriangle, Package } from "lucide-react";

export default function RestockPage() {
  const [queue, setQueue]         = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);

  // Restock modal
  const [restockModal, setRestockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity]   = useState("");
  const [saving, setSaving]       = useState(false);
  const [restockError, setRestockError] = useState("");

  // Remove confirm
  const [removeId, setRemoveId]   = useState(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await restockService.getQueue({ page, limit: 10 });
      setQueue(res.data?.queue || []);
      setPagination(res.data?.pagination || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const openRestock = (item) => {
    setSelectedItem(item);
    setQuantity("");
    setRestockError("");
    setRestockModal(true);
  };

  const handleRestock = async () => {
    if (!quantity || Number(quantity) <= 0) {
      setRestockError("Please enter a valid quantity");
      return;
    }
    setSaving(true);
    try {
      await restockService.restock(selectedItem._id, Number(quantity));
      setRestockModal(false);
      fetchQueue();
    } catch (err) {
      setRestockError(err.response?.data?.message || "Restock failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    try {
      await restockService.removeFromQueue(removeId);
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || "Remove failed");
    }
  };

  const priorityColor = (priority) => ({
    High:   "bg-red-100 text-red-700 border border-red-200",
    Medium: "bg-amber-100 text-amber-700 border border-amber-200",
    Low:    "bg-green-100 text-green-700 border border-green-200",
  }[priority] || "bg-gray-100 text-gray-600");

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Restock Queue</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {pagination?.total ?? 0} items below minimum stock threshold
            </p>
          </div>
          <Button variant="ghost" icon={RefreshCw} onClick={fetchQueue}>Refresh</Button>
        </div>

        {/* Alert Banner */}
        {(pagination?.total ?? 0) > 0 && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              <span className="font-semibold">{pagination?.total} product(s)</span> need restocking.
              High priority items are shown first.
            </p>
          </div>
        )}

        {/* Queue Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? <PageLoader /> : queue.length === 0 ? (
            <EmptyState
              message="All products are sufficiently stocked! 🎉"
              icon={Package}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-900 uppercase">Product</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-900 uppercase">Category</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-900 uppercase">Current Stock</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-900 uppercase">Min Threshold</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-900 uppercase">Priority</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-900 uppercase">Status</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-gray-900 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {queue.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Package className="w-3.5 h-3.5 text-orange-600" />
                            </div>
                            <span className="font-medium text-gray-900">
                              {item.product?.name || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">
                          {item.product?.category?.name || "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`font-bold text-lg ${
                            item.currentStock === 0 ? "text-red-500" : "text-amber-500"
                          }`}>
                            {item.currentStock}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">{item.minStockThreshold}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${priorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={item.product?.status} />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost" size="sm" icon={Plus}
                              onClick={() => openRestock(item)}
                              className="text-green-600 hover:bg-green-50"
                            >
                              Restock
                            </Button>
                            <Button
                              variant="ghost" size="sm" icon={Trash2}
                              onClick={() => setRemoveId(item._id)}
                              className="text-red-500 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 pb-4">
                <Pagination pagination={pagination} onPageChange={setPage} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Restock Modal */}
      <Modal
        isOpen={restockModal}
        onClose={() => setRestockModal(false)}
        title={`Restock — ${selectedItem?.product?.name}`}
        size="sm"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-red-400 text-xs mb-1">Current Stock</p>
              <p className="font-bold text-red-600 text-xl">{selectedItem?.currentStock}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-blue-400 text-xs mb-1">Min Threshold</p>
              <p className="font-bold text-blue-600 text-xl">{selectedItem?.minStockThreshold}</p>
            </div>
          </div>

          <Input
            label="Quantity to Add"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => { setQuantity(e.target.value); setRestockError(""); }}
            placeholder="Enter quantity to restock..."
            error={restockError}
            autoFocus
          />

          {quantity && Number(quantity) > 0 && (
            <div className="p-3 bg-green-50 rounded-lg text-sm text-green-700">
              New stock will be:{" "}
              <span className="font-bold">
                {(selectedItem?.currentStock || 0) + Number(quantity)} units
              </span>
              {(selectedItem?.currentStock || 0) + Number(quantity) >= (selectedItem?.minStockThreshold || 0) && (
                <span className="ml-2">✅ Above threshold</span>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setRestockModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="success" onClick={handleRestock} loading={saving} className="flex-1">
              Confirm Restock
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove Confirm */}
      <ConfirmDialog
        isOpen={!!removeId}
        onClose={() => setRemoveId(null)}
        onConfirm={handleRemove}
        title="Remove from Queue"
        message="Remove this item from the restock queue? The product stock will remain unchanged."
        confirmLabel="Remove"
        danger
      />
    </DashboardLayout>
  );
}
