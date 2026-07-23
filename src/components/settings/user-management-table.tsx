"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { USER_ROLES } from "@/lib/constants";
import { useUsers, type UserSummary } from "@/hooks/use-users";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function RoleSelect({ user }: { user: UserSummary }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (role: string) => {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed to update role");
    },
    onSuccess: () => {
      toast.success(`Updated ${user.name}'s role`);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Failed to update role"),
  });

  return (
    <Select value={user.role} onValueChange={(v) => mutation.mutate(v)} disabled={mutation.isPending}>
      <SelectTrigger className="w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {USER_ROLES.map((r) => (
          <SelectItem key={r.value} value={r.value}>
            {r.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function UserManagementTable() {
  const { data, isLoading } = useUsers();
  const users = data?.data ?? [];

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell colSpan={2}>
                <Skeleton className="h-10 w-full" />
              </TableCell>
            </TableRow>
          ))}

        {!isLoading &&
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-medium">{user.name}</p>
                </div>
              </TableCell>
              <TableCell>
                <RoleSelect user={user} />
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
