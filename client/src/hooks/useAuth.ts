import { useCallback, useState } from "react";

import { api, getToken } from "../api";

export interface Auth {
  isAdmin: boolean;
  login: (password: string) => Promise<void>;
  logout: () => void;
}

export function useAuth(): Auth {
  const [isAdmin, setIsAdmin] = useState(() => getToken() !== null);

  const login = useCallback(async (password: string) => {
    await api.login(password);
    setIsAdmin(true);
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setIsAdmin(false);
  }, []);

  return { isAdmin, login, logout };
}
