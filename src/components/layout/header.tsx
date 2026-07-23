"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Bell, HelpCircle, Menu, Moon, Search, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NAV_ITEMS } from "@/lib/nav";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useUIStore } from "@/store/ui-store";
import { useProjects } from "@/hooks/use-projects";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function roleLabel(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

const NOTIFICATIONS = [
  { title: "STR_03_SECOND FLOOR PLAN.pdf is pending your approval", time: "5 min ago" },
  { title: "Karthik S approved COLUMN SCHEDULE.xlsx", time: "2 hours ago" },
  { title: "New RFI raised on Structural discipline", time: "Yesterday" },
];

export function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const pageTitle = useUIStore((s) => s.pageTitle);
  const pageSubtitle = useUIStore((s) => s.pageSubtitle);
  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: projectsData } = useProjects();
  const projects = projectsData?.data ?? [];
  const activeProjectId = searchParams.get("project") ?? projects[0]?.id ?? "";
  const { data: session } = useSession();
  const user = session?.user;

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard next-themes hydration-safe mount check
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 backdrop-blur-xl px-4 lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar text-sidebar-foreground border-sidebar-border">
          <nav className="p-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent"
              >
                <item.icon className="size-4.5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="min-w-0 shrink-0 hidden sm:block">
        <h1 className="text-base font-semibold tracking-tight leading-tight truncate">{pageTitle}</h1>
        {pageSubtitle && (
          <p className="text-xs text-muted-foreground truncate leading-tight">{pageSubtitle}</p>
        )}
      </div>

      <div className="flex-1" />

      <div className="relative hidden md:block w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input placeholder="Search documents, projects, folders…" className="pl-9 bg-muted/50 border-transparent focus-visible:border-ring" />
      </div>

      <Select
        value={activeProjectId}
        onValueChange={(value) => {
          if (pathname === "/documents") {
            router.push(`/documents?project=${value}`);
          }
        }}
      >
        <SelectTrigger className="hidden md:flex w-[200px] bg-muted/50 border-transparent">
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="ghost" size="icon" className="hidden sm:inline-flex" aria-label="Help">
        <HelpCircle className="size-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      >
        {mounted && resolvedTheme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="size-5" />
            <Badge className="absolute -top-1 -right-1 h-4.5 min-w-4.5 justify-center rounded-full bg-red-500 px-1 text-[10px] text-white border-2 border-background">
              {NOTIFICATIONS.length}
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {NOTIFICATIONS.map((n, i) => (
            <DropdownMenuItem key={i} className="flex-col items-start gap-0.5 py-2.5">
              <span className="text-sm leading-snug">{n.title}</span>
              <span className="text-xs text-muted-foreground">{n.time}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-muted transition-colors">
            <Avatar className="size-8">
              <AvatarImage src="" alt={user?.name ?? ""} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                {user?.name ? initials(user.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block text-left leading-tight">
              <p className="text-sm font-medium">{user?.name ?? "…"}</p>
              <p className="text-xs text-muted-foreground">{user?.role ? roleLabel(user.role) : ""}</p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onSelect={() => signOut({ callbackUrl: "/login" })}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
