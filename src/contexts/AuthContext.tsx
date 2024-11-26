import { createContext, useContext, useState, useEffect } from "react";
import { pb } from "../lib/pocketbase";
import toast from "react-hot-toast";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid);
  const [user, setUser] = useState(pb.authStore.model);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setIsAuthenticated(pb.authStore.isValid);
      setUser(model);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await pb.collection("users").authWithPassword(email, password);
      toast.success("Welcome back!");
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      await pb.collection("users").authWithOAuth2({ provider: "google" });
      toast.success("Welcome!");
    } catch (error: any) {
      toast.error(error.message || "Failed to login with Google");
      throw error;
    }
  };

  const logout = () => {
    pb.authStore.clear();
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
