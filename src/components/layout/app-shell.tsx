import { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Suspense fallback={<div className="h-16 border-b border-border/60" />}>
          <Header />
        </Suspense>
        <main className="flex-1 p-4 lg:p-6 max-w-[1920px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
