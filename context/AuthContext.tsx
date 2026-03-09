import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthUser = {
  _id: string;
  username: string;
  name: string;
  role: 'student' | 'admin';
};

type Ctx = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (u: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<Ctx>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

const KEY = '@siu_user';

// ✅ NAMED export function — fix untuk error TS2614
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [isLoading, setLoad]  = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(v => { if (v) setUser(JSON.parse(v)); })
      .catch(() => {})
      .finally(() => setLoad(false));
  }, []);

  const login = async (u: AuthUser) => {
    setUser(u);
    await AsyncStorage.setItem(KEY, JSON.stringify(u));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ NAMED export function — fix untuk error TS2614
export function useAuth() {
  return useContext(AuthContext);
}