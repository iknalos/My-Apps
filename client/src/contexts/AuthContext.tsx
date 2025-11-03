import { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  username: string;
  role: 'admin' | 'player';
  playerId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (res.status === 401) {
          return null;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch user");
        }

        return await res.json();
      } catch (error) {
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      setUser(data as User);
    } else {
      setUser(null);
    }
  }, [data]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
