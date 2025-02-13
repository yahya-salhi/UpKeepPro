import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isChekingAuth: true,
  getMe: async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      set({ authUser: res.data.user || null });
    } catch (error) {
      console.log("Error in getMe:", error.message);
      set({ authUser: null });
    } finally {
      set({ isChekingAuth: false });
    }
  },
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const token = localStorage.getItem("token"); // Get the stored token
      const res = await axiosInstance.post("/users/signup", data, {
        headers: { Authorization: `Bearer ${token}` }, // Attach token
      });
      set({ authUser: res.data });
      toast.success("Account created successfully");
    } catch (error) {
      console.error("Error in signup:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.user });
      toast.success("Login successfully");
    } catch (error) {
      console.error("Error in login:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });

      toast.success("Logout successfully");
    } catch (error) {
      console.log("Error in logout:", error.message);
      toast.error("Error in logout");
    }
  },
}));
