import api from "@/lib/axios";

const authService = {
  signup: async (data) => {
    const res = await api.post("/auth/signup", data);
    return res.data;
  },

  login: async (data) => {
    const res = await api.post("/auth/login", data);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },
};

export default authService;
