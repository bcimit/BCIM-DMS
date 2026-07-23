"use client";

import * as React from "react";
import { useUIStore } from "@/store/ui-store";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const setPageHeader = useUIStore((s) => s.setPageHeader);

  React.useEffect(() => {
    setPageHeader(title, subtitle);
  }, [title, subtitle, setPageHeader]);

  return null;
}
