import api from "@/lib/axios";

const restockService = {
  getQueue: async (params = {}) => {
    const res = await api.get("/restock", { params });
    return res.data;
  },

  restock: async (id, quantity) => {
    const res = await api.patch(`/restock/${id}/restock`, { quantity });
    return res.data;
  },

  removeFromQueue: async (id) => {
    const res = await api.delete(`/restock/${id}`);
    return res.data;
  },
};

export default restockService;
