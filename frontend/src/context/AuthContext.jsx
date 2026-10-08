import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = loading, false = logged out
  const [cartCount, setCartCount] = useState(0);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("qo_token");
    if (!token) {
      setUser(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch (e) {
      localStorage.removeItem("qo_token");
      setUser(false);
    }
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      const { data } = await api.get("/cart");
      setCartCount(data.items.length);
    } catch (e) {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user && user.role === "user") refreshCart();
  }, [user, refreshCart]);

  const login = async (username, password, remember) => {
    const { data } = await api.post("/auth/login", { username, password, remember });
    localStorage.setItem("qo_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("qo_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("qo_token");
    setUser(false);
    setCartCount(0);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, register, logout, cartCount, refreshCart }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
