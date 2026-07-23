"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

function roleLabel(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function ProfileFormContent({
  initialName,
  email,
  role,
  update,
}: {
  initialName: string;
  email: string;
  role: string;
  update: ReturnType<typeof useSession>["update"];
}) {
  const [name, setName] = React.useState(initialName);
  const [saving, setSaving] = React.useState(false);

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error();
      await update({ name });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 max-w-sm">
      <div className="space-y-1.5">
        <Label htmlFor="profile-name">Full Name</Label>
        <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input value={email} disabled />
      </div>
      <div className="space-y-1.5">
        <Label>Role</Label>
        <Input value={roleLabel(role)} disabled />
      </div>
      <Button onClick={handleSave} disabled={saving}>
        Save Changes
      </Button>
    </div>
  );
}

export function ProfileForm() {
  const { data: session, status, update } = useSession();

  if (status === "loading" || !session?.user) {
    return <Skeleton className="h-40 w-full max-w-sm rounded-xl" />;
  }

  return (
    <ProfileFormContent
      key={session.user.id}
      initialName={session.user.name ?? ""}
      email={session.user.email ?? ""}
      role={session.user.role}
      update={update}
    />
  );
}
