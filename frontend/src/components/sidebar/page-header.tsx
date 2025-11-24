import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "@tanstack/react-router";
import { useMemo } from "react";

export function PageHeader() {
  const router = useRouter();

  const title = useMemo(() => {
    const pathname = router.latestLocation.pathname;

    if (pathname === "/") return "Notes";
    if (pathname.startsWith("/notes")) return "Notes";
    if (pathname === "/settings") return "Settings";

    const title = pathname.split("/").pop();

    return title ? title.charAt(0).toUpperCase() + title.slice(1) : "Notes";
  }, [router.latestLocation.pathname]);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-lg font-semibold">{title}</h1>
        <ThemeToggle />
      </div>
    </header>
  );
}
