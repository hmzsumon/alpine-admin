/* ── Provider: AuthProvider ────────────────────────────────────────────── */
"use client";
/* ────────── imports ────────── */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { AuthUser, Permission } from "@/types/auth";
const AuthContext = createContext<{
  user: AuthUser;
  can: (permission: Permission) => boolean;
  logout: () => Promise<void>;
} | null>(null);

/* ────────── live user and permission context ────────── */
export default function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: AuthUser;
  children: ReactNode;
}) {
  const [user, setUser] = useState(initialUser);
  const router = useRouter();
  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (response.status === 401) {
        router.replace("/login");
        router.refresh();
        return;
      }
      if (response.ok) setUser((await response.json()).user);
    } catch {}
  }, [router]);
  useEffect(() => {
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refresh]);
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/login");
    router.refresh();
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        can: (permission) => user.permissions.includes(permission),
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthProvider is required");
  return context;
}
