import api from "@/lib/axios";

const dashboardService = {
  getStats: async () => {
    const res = await api.get("/dashboard");
    return res.data;
  },
};

export default dashboardService;
