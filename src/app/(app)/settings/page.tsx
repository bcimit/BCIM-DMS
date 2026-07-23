import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "@/components/settings/profile-form";
import { UserManagementTable } from "@/components/settings/user-management-table";
import { ErpSyncPanel } from "@/components/settings/erp-sync-panel";
import { isAdminRole } from "@/lib/permissions";

export default async function SettingsPage() {
  const session = await auth();
  const isAdmin = isAdminRole(session?.user?.role);

  return (
    <div className="space-y-4">
      <PageHeader title="Settings" subtitle="Configure your workspace preferences" />

      <div className="glass-panel rounded-2xl p-5">
        <h2 className="text-lg font-semibold mb-4">My Profile</h2>
        <ProfileForm />
      </div>

      {isAdmin && (
        <div className="glass-panel rounded-2xl p-5">
          <h2 className="text-lg font-semibold mb-1">User Management</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Manage roles for everyone in your workspace. Only Super Admins, Project Directors, Project Managers,
            and Document Controllers can access this section.
          </p>
          <UserManagementTable />
        </div>
      )}

      {isAdmin && (
        <div className="glass-panel rounded-2xl p-5">
          <h2 className="text-lg font-semibold mb-1">ERP Sync</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Automatically pulls approved Work Orders, Purchase Orders, and Material Requisitions from ConstructERP
            every 10 minutes.
          </p>
          <ErpSyncPanel />
        </div>
      )}
    </div>
  );
}
