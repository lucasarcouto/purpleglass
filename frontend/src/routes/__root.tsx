import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "@/core/theme/theme-provider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { PageHeader } from "@/components/sidebar/page-header";
import { useAuth } from "@/hooks/use-auth";
import { AuthProvider } from "@/core/auth/auth-provider";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <AuthProvider>
      <RootContent />
    </AuthProvider>
  );
}

function RootContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </ThemeProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex flex-col">
          <Outlet />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "16rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <PageHeader />
          <div className="flex flex-1 flex-col gap-4 p-4">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
