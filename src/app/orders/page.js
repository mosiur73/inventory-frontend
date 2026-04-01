"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Button, Modal, Input, Select, PageLoader,
  EmptyState, ConfirmDialog, StatusBadge, Pagination,
} from "@/components/ui";
import orderService from "@/services/order.service";
import productService from "@/services/product.service";
import {
  ShoppingCart, Plus, Eye, X, Trash2,
  Search, ChevronDown, AlertCircle,
} from "lucide-react";

const STATUS_OPTIONS = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

export default function OrdersPage() {
  const [orders, setOrders]       = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);

  // Filters
  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [startDate, setStartDate]     = useState("");
  const [endDate, setEndDate]         = useState("");

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Create form
  const [customerName, setCustomerName] = useState("");
  const [orderItems, setOrderItems]     = useState([{ product: "", quantity: 1 }]);
  const [products, setProducts]         = useState([]);
  const [createError, setCreateError]   = useState("");
  const [saving, setSaving]             = useState(false);

  // Status update
  const [newStatus, setNewStatus]   = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search)       params.search    = search;
      if (filterStatus) params.status    = filterStatus;
      if (startDate)    params.startDate = startDate;
      if (endDate)      params.endDate   = endDate;

      const res = await orderService.getAll(params);
      setOrders(res.data?.orders || []);
      setPagination(res.data?.pagination || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStatus, startDate, endDate]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    // Load all products including inactive — show warning for unavailable ones
    productService.getAll({ limit: 100 })
      .then((res) => setProducts(res.data?.products || []));
  }, []);

  // ── Create Order ──────────────────────────────────────────
  const openCreate = () => {
    setCustomerName("");
    setOrderItems([{ product: "", quantity: 1 }]);
    setCreateError("");
    setCreateModal(true);
  };

  const addItem = () => {
    setOrderItems([...orderItems, { product: "", quantity: 1 }]);
  };

  const removeItem = (idx) => {
    setOrderItems(orderItems.filter((_, i) => i !== idx));
  };

  const updateItem = (idx, field, value) => {
    const updated = [...orderItems];
    updated[idx][field] = value;
    setOrderItems(updated);
    setCreateError("");
  };

  const handleCreate = async () => {
    if (!customerName.trim()) { setCreateError("Customer name is required"); return; }
    if (orderItems.some((i) => !i.product)) { setCreateError("Please select a product for each item"); return; }
    if (orderItems.some((i) => !i.quantity || i.quantity < 1)) { setCreateError("Quantity must be at least 1"); return; }

    // Conflict 1: duplicate products
    const productIds = orderItems.map((i) => i.product);
    if (new Set(productIds).size !== productIds.length) {
      setCreateError("This product is already added to the order.");
      return;
    }

    // Conflict 2: inactive / out of stock products
    for (const item of orderItems) {
      const product = products.find((p) => p._id === item.product);
      if (product && product.status === "Out of Stock") {
        setCreateError(`"${product.name}" is currently unavailable.`);
        return;
      }
      // Conflict 3: insufficient stock
      if (product && Number(item.quantity) > product.stock) {
        setCreateError(`Only ${product.stock} item(s) available in stock for "${product.name}".`);
        return;
      }
    }

    setSaving(true);
    try {
      await orderService.create({
        customerName: customerName.trim(),
        items: orderItems.map((i) => ({
          product: i.product,
          quantity: Number(i.quantity),
        })),
      });
      setCreateModal(false);
      fetchOrders();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create order");
    } finally {
      setSaving(false);
    }
  };

  // ── Status Update ─────────────────────────────────────────
  const openStatusUpdate = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setCancelReason("");
    setStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setUpdatingStatus(true);
    try {
      await orderService.updateStatus(selectedOrder._id, newStatus, cancelReason || null);
      setStatusModal(false);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Status update failed");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ── View Detail ───────────────────────────────────────────
  const openDetail = (order) => {
    setSelectedOrder(order);
    setDetailModal(true);
  };

  const clearFilters = () => {
    setSearch(""); setFilterStatus("");
    setStartDate(""); setEndDate(""); setPage(1);
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Orders</h2>
            <p className="text-sm text-gray-500 mt-0.5">{pagination?.total ?? 0} orders total</p>
          </div>
          <Button icon={Plus} onClick={openCreate}>New Order</Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search orders / customers..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="date" value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input type="date" value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {(search || filterStatus || startDate || endDate) && (
              <Button variant="ghost" size="md" icon={X} onClick={clearFilters}>Clear</Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? <PageLoader /> : orders.length === 0 ? (
            <EmptyState message="No orders found" icon={ShoppingCart} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Order #</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Items</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-semibold text-blue-600">{order.orderNumber}</span>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-gray-900">{order.customerName}</td>
                        <td className="px-5 py-3.5 text-gray-500">{order.items?.length} item(s)</td>
                        <td className="px-5 py-3.5 font-semibold text-gray-900">${order.totalPrice?.toFixed(2)}</td>
                        <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                        <td className="px-5 py-3.5 text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" icon={Eye} onClick={() => openDetail(order)}>
                              View
                            </Button>
                            {order.status !== "Cancelled" && order.status !== "Delivered" && (
                              <Button variant="ghost" size="sm" icon={ChevronDown}
                                onClick={() => openStatusUpdate(order)}>
                                Status
                              </Button>
                            )}
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

      {/* ── Create Order Modal ── */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create New Order" size="lg">
        <div className="space-y-4">
          {createError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {createError}
            </div>
          )}

          <Input
            label="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name..."
          />

          {/* Order Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Order Items</label>
              <Button variant="ghost" size="sm" icon={Plus} onClick={addItem}>Add Item</Button>
            </div>
            <div className="space-y-2">
              {orderItems.map((item, idx) => {
                const selectedProduct = products.find((p) => p._id === item.product);
                return (
                  <div key={idx} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <select
                        value={item.product}
                        onChange={(e) => updateItem(idx, "product", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                          ${selectedProduct && selectedProduct.status === "Out of Stock"
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"}`}
                      >
                        <option value="">Select product...</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id} disabled={p.status === "Out of Stock"}>
                            {p.status === "Out of Stock"
                              ? `❌ ${p.name} — Unavailable`
                              : `${p.name} — $${p.price} (Stock: ${p.stock})`}
                          </option>
                        ))}
                      </select>

                      {/* Conflict warnings */}
                      {selectedProduct && selectedProduct.status === "Out of Stock" && (
                        <p className="text-xs text-red-500 mt-1 ml-1 font-medium">
                          ⚠️ This product is currently unavailable.
                        </p>
                      )}
                      {selectedProduct && selectedProduct.status === "Active" && (
                        <p className="text-xs text-gray-400 mt-1 ml-1">
                          Available: {selectedProduct.stock} units
                        </p>
                      )}
                      {selectedProduct && selectedProduct.status === "Active" &&
                        item.quantity > selectedProduct.stock && (
                        <p className="text-xs text-red-500 mt-1 ml-1 font-medium">
                          ⚠️ Only {selectedProduct.stock} item(s) available in stock.
                        </p>
                      )}
                      {/* Duplicate product warning */}
                      {item.product && orderItems.filter((i) => i.product === item.product).length > 1 && (
                        <p className="text-xs text-red-500 mt-1 ml-1 font-medium">
                          ⚠️ This product is already added to the order.
                        </p>
                      )}
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        max={selectedProduct?.stock || 9999}
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Qty"
                      />
                    </div>
                    {orderItems.length > 1 && (
                      <button onClick={() => removeItem(idx)}
                        className="mt-2 text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total Preview */}
          {orderItems.some((i) => i.product && i.quantity) && (
            <div className="p-3 bg-blue-50 rounded-lg text-sm">
              <div className="flex justify-between font-semibold text-blue-700">
                <span>Estimated Total:</span>
                <span>
                  ${orderItems.reduce((sum, item) => {
                    const p = products.find((p) => p._id === item.product);
                    return sum + (p ? p.price * (Number(item.quantity) || 0) : 0);
                  }, 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setCreateModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleCreate} loading={saving} className="flex-1">Place Order</Button>
          </div>
        </div>
      </Modal>

      {/* ── Order Detail Modal ── */}
      <Modal isOpen={detailModal} onClose={() => setDetailModal(false)} title={`Order ${selectedOrder?.orderNumber}`} size="lg">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-1">Customer</p>
                <p className="font-semibold text-gray-900">{selectedOrder.customerName}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-1">Status</p>
                <StatusBadge status={selectedOrder.status} />
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-1">Order Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-1">Total Price</p>
                <p className="font-bold text-gray-900 text-lg">${selectedOrder.totalPrice?.toFixed(2)}</p>
              </div>
            </div>

            {/* Cancel reason */}
            {selectedOrder.cancelReason && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                <span className="font-medium">Cancel Reason:</span> {selectedOrder.cancelReason}
              </div>
            )}

            {/* Items */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Order Items</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Product</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Qty</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Unit Price</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2.5 font-medium text-gray-900">{item.productName}</td>
                        <td className="px-4 py-2.5 text-gray-600">{item.quantity}</td>
                        <td className="px-4 py-2.5 text-gray-600">${item.priceAtOrder}</td>
                        <td className="px-4 py-2.5 text-right font-semibold">
                          ${(item.quantity * item.priceAtOrder).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Status Update Modal ── */}
      <Modal isOpen={statusModal} onClose={() => setStatusModal(false)} title="Update Order Status" size="sm">
        <div className="space-y-4">
          <Select
            label="New Status"
            value={newStatus}
            onChange={(e) => { setNewStatus(e.target.value); setCancelReason(""); }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} disabled={
                (selectedOrder?.status === "Shipped" && s === "Pending") ||
                (selectedOrder?.status === "Delivered" && s !== "Delivered")
              }>{s}</option>
            ))}
          </Select>

          {newStatus === "Cancelled" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Cancel Reason (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-amber-600 mt-1.5">
                ⚠️ Cancelling will restore stock for all items.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setStatusModal(false)} className="flex-1">Cancel</Button>
            <Button
              onClick={handleStatusUpdate}
              loading={updatingStatus}
              variant={newStatus === "Cancelled" ? "danger" : "primary"}
              className="flex-1"
            >
              Update Status
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
