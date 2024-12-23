import { create } from "zustand";
import { User } from "../types/userType";
import { createJSONStorage, persist } from "zustand/middleware";

interface UserState {
  user: User | null;
  error: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  logout: () => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      error: null,
      loading: false,
      isAuthenticated: false,
      setUser: (user: User | null) => set({ user }),
      setError: (error: string | null) => set({ error }),
      setLoading: (loading: boolean) => set({ loading }),
      setIsAuthenticated: (isAuthenticated: boolean) =>
        set({ isAuthenticated }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: "user", storage: createJSONStorage(() => localStorage) }
  )
);

export default useUserStore;
