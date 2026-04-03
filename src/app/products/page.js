"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Button, Modal, Input, Select, PageLoader,
  EmptyState, ConfirmDialog, StatusBadge, Pagination,
} from "@/components/ui";
import productService from "@/services/product.service";
import categoryService from "@/services/category.service";
import { Package, Plus, Pencil, Trash2, RefreshCw, Search, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const EMPTY_FORM = {
  name: "", category: "", price: "", stock: "", minStockThreshold: "5",
};

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);

  // Filters
  const [search, setSearch]         = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus]     = useState("");

  // Modals
  const [modalOpen, setModalOpen]   = useState(false);
  const [restockModal, setRestockModal] = useState(false);
  const [deleteId, setDeleteId]     = useState(null);
  const [editItem, setEditItem]     = useState(null);
  const [restockItem, setRestockItem] = useState(null);

  // Form
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving]         = useState(false);
  const [restockQty, setRestockQty] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search)         params.search   = search;
      if (filterCategory) params.category = filterCategory;
      if (filterStatus)   params.status   = filterStatus;

      const res = await productService.getAll(params);
      setProducts(res.data?.products || []);
      setPagination(res.data?.pagination || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, filterCategory, filterStatus]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    categoryService.getAll().then((res) => setCategories(res.data || []));
  }, []);

  
  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditItem(product);
    setForm({
      name:              product.name,
      category:          product.category?._id || "",
      price:             product.price,
      stock:             product.stock,
      minStockThreshold: product.minStockThreshold,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openRestock = (product) => {
    setRestockItem(product);
    setRestockQty("");
    setRestockModal(true);
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim())  errors.name     = "Product name is required";
    if (!form.category)     errors.category = "Category is required";
    if (form.price === "" || Number(form.price) < 0) errors.price = "Valid price is required";
    if (form.stock === "" || Number(form.stock) < 0) errors.stock = "Valid stock is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name:              form.name.trim(),
        category:          form.category,
        price:             Number(form.price),
        stock:             Number(form.stock),
        minStockThreshold: Number(form.minStockThreshold) || 5,
      };
      if (editItem) {
        await productService.update(editItem._id, payload);
      } else {
        await productService.create(payload);
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      setFormErrors({ api: err.response?.data?.message || "Something went wrong" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await productService.delete(deleteId);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const handleRestock = async () => {
    if (!restockQty || Number(restockQty) <= 0) return;
    try {
      await productService.restock(restockItem._id, Number(restockQty));
      setRestockModal(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Restock failed");
    }
  };

  const clearFilters = () => {
    setSearch(""); setFilterCategory(""); setFilterStatus(""); setPage(1);
  };

  const hasFilters = search || filterCategory || filterStatus;


  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Products</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {pagination?.total ?? 0} products total
            </p>
          </div>
          <Button icon={Plus} onClick={openCreate}>Add Product</Button>
        </div>

        {/* Filters */}
        <div className="bg-white text-black rounded-xl border border-gray-200 p-4">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category filter */}
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>

            {/* Clear */}
            {hasFilters && (
              <Button variant="ghost" size="md" icon={X} onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <PageLoader />
          ) : products.length === 0 ? (
            <EmptyState message="No products found" icon={Package} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Min Threshold</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package className="w-3.5 h-3.5 text-indigo-600" />
                            </div>
                            <span className="font-medium text-gray-900">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">{p.category?.name || "—"}</td>
                        <td className="px-5 py-3.5 font-medium text-gray-900">${p.price}</td>
                        <td className="px-5 py-3.5">
                          <span className={`font-semibold ${
                            p.stock === 0 ? "text-red-500" :
                            p.stock < p.minStockThreshold ? "text-amber-500" : "text-green-600"
                          }`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">{p.minStockThreshold}</td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" icon={RefreshCw}
                              onClick={() => openRestock(p)}
                              className="text-green-600 hover:bg-green-50"
                            >
                              Restock
                            </Button>
                            <Button variant="ghost" size="sm" icon={Pencil} onClick={() => openEdit(p)}>
                              Edit
                            </Button>
                            {user?.role === "admin" && (
                              <Button variant="ghost" size="sm" icon={Trash2}
                                onClick={() => setDeleteId(p._id)}
                                className="text-red-500 hover:bg-red-50"
                              >
                                Delete
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Product" : "Add Product"}
        size="md"
      >
        <div className="space-y-4">
          {formErrors.api && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {formErrors.api}
            </div>
          )}
          <Input
            label="Product Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. iPhone 15 Pro"
            error={formErrors.name}
          />
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            error={formErrors.category}
          >
            <option value="">Select category...</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price ($)"
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="0.00"
              error={formErrors.price}
            />
            <Input
              label="Stock Quantity"
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              placeholder="0"
              error={formErrors.stock}
            />
          </div>
          <Input
            label="Min Stock Threshold"
            type="number"
            min="0"
            value={form.minStockThreshold}
            onChange={(e) => setForm({ ...form, minStockThreshold: e.target.value })}
            placeholder="5"
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving} className="flex-1">
              {editItem ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Restock Modal */}
      <Modal
        isOpen={restockModal}
        onClose={() => setRestockModal(false)}
        title={`Restock — ${restockItem?.name}`}
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            Current stock: <span className="font-bold">{restockItem?.stock} units</span>
          </div>
          <Input
            label="Quantity to Add"
            type="number"
            min="1"
            value={restockQty}
            onChange={(e) => setRestockQty(e.target.value)}
            placeholder="Enter quantity..."
            autoFocus
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setRestockModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="success" onClick={handleRestock} className="flex-1">
              Add Stock
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </DashboardLayout>
  );
}
