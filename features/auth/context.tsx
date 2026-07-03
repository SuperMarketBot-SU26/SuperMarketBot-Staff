/**
 * AuthContext — global "am I logged in?" state.
 *
 * On mount, restores the session from SecureStore if a refresh token is
 * present. Exposes login / logout helpers (which delegate to shared/api/auth).
 *
 * Screens read `status` to decide whether to redirect to /login or into
 * the app, and `user` for role-gated UI.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AuthApi,
  getTokens,
  type AuthResponseDto,
} from "@/shared/api";

type Status = "loading" | "unauthenticated" | "authenticated";

export interface AuthContextValue {
  status: Status;
  user: AuthResponseDto | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<AuthResponseDto | null>(null);

  // On mount: try to restore the session by reading tokens and refreshing
  // (the access token may have expired). We don't surface "stale access
  // token" errors here — if refresh fails we just clear and render /login.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await getTokens();
      if (!stored) {
        if (!cancelled) setStatus("unauthenticated");
        return;
      }
      const fresh = await AuthApi.refresh();
      if (cancelled) return;
      if (fresh) {
        setUser(fresh);
        setStatus("authenticated");
      } else {
        setStatus("unauthenticated");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await AuthApi.login({ email, password });
    setUser(res);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    await AuthApi.logout();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, logout }),
    [status, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}