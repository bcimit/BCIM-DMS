"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";

export function ProjectsToolbar() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-950/20"
      >
        <Plus className="size-4" />
        New Project
      </Button>
      <CreateProjectDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
