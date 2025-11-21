import { useCallback, useMemo, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/core/services/auth-service";
import type { LoginCredentials, RegisterCredentials } from "@/core/api/types";
import { AuthContext, type AuthContextValue } from "./auth-context";

const AUTH_QUERY_KEY = ["auth", "user"];

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: authService.getCurrentUser,
    enabled: authService.hasToken(),
    staleTime: Infinity,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      await loginMutation.mutateAsync(credentials);
    },
    [loginMutation]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials): Promise<void> => {
      await registerMutation.mutateAsync(credentials);
    },
    [registerMutation]
  );

  const logout = useCallback(async (): Promise<void> => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const value: AuthContextValue = useMemo(
    () => ({
      user: user ?? null,
      isLoading: isLoading || isFetching,
      isAuthenticated: !!user || authService.hasToken(),
      login,
      register,
      logout,
    }),
    [user, isLoading, isFetching, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
