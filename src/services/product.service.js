import api from "@/lib/axios";

const productService = {
  getAll: async (params = {}) => {
    const res = await api.get("/products", { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post("/products", data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/products/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },

  restock: async (id, quantity) => {
    const res = await api.patch(`/products/${id}/restock`, { quantity });
    return res.data;
  },
};

export default productService;
