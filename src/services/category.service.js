import api from "@/lib/axios";

const categoryService = {
  getAll: async () => {
    const res = await api.get("/categories");
    return res.data;
  },

  create: async (name) => {
    const res = await api.post("/categories", { name });
    return res.data;
  },

  update: async (id, name) => {
    const res = await api.put(`/categories/${id}`, { name });
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },
};

export default categoryService;
