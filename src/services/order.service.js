import api from "@/lib/axios";

const orderService = {
  getAll: async (params = {}) => {
    const res = await api.get("/orders", { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post("/orders", data);
    return res.data;
  },

  updateStatus: async (id, status, cancelReason = null) => {
    const res = await api.patch(`/orders/${id}/status`, { status, cancelReason });
    return res.data;
  },

  cancel: async (id, cancelReason) => {
    const res = await api.patch(`/orders/${id}/cancel`, { cancelReason });
    return res.data;
  },
};

export default orderService;
