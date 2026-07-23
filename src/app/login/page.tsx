import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Building2 } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-app-gradient p-4">
      <div className="w-full max-w-sm glass-panel-lg rounded-2xl p-8 space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-950/30">
            <Building2 className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">BCIM Construction ERP</h1>
            <p className="text-sm text-muted-foreground">Sign in to Document Management</p>
          </div>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
