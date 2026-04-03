"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button, Modal, Input, PageLoader, EmptyState, ConfirmDialog } from "@/components/ui";
import categoryService from "@/services/category.service";
import { Tag, Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setName("");
    setError("");
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditItem(cat);
    setName(cat.name);
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { setError("Category name is required"); return; }
    setSaving(true);
    try {
      if (editItem) {
        await categoryService.update(editItem._id, name.trim());
      } else {
        await categoryService.create(name.trim());
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await categoryService.delete(deleteId);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Categories</h2>
            <p className="text-sm text-gray-500 mt-0.5">{categories.length} categories total</p>
          </div>
          <Button icon={Plus} onClick={openCreate}>Add Category</Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <PageLoader />
          ) : categories.length === 0 ? (
            <EmptyState message="No categories yet. Create one!" icon={Tag} />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-900 uppercase">#</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-900 uppercase">Category Name</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-900 uppercase">Created By</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-900 uppercase">Created At</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-900 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat, idx) => (
                  <tr key={cat._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5 text-gray-900">{idx + 1}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Tag className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{cat.createdBy?.name || "—"}</td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {new Date(cat.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" icon={Pencil} onClick={() => openEdit(cat)}>
                          Edit
                        </Button>
                        {user?.role === "admin" && (
                          <Button variant="ghost" size="sm" icon={Trash2}
                            onClick={() => setDeleteId(cat._id)}
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
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Category" : "Add Category"}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            value={name}
            className="text-black"
            onChange={(e) => { setName(e.target.value); setError(""); }}
            placeholder="e.g. Electronics, Clothing..."
            error={error}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
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

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </DashboardLayout>
  );
}
