import api from "@/lib/axios";

const activityLogService = {
  getLogs: async (params = {}) => {
    const res = await api.get("/activity-logs", { params });
    return res.data;
  },
};

export default activityLogService;
