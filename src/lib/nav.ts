import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FolderKanban,
  FileStack,
  PencilRuler,
  MessageCircleQuestion,
  FileCheck2,
  Send,
  Mail,
  CheckSquare,
  ShieldCheck,
  HardHat,
  FileSignature,
  Calculator,
  PackageCheck,
  ClipboardCheck,
  BarChart3,
  Trash2,
  Settings,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Document Management", href: "/documents", icon: FileStack },
  { label: "Drawings", href: "/drawings", icon: PencilRuler },
  { label: "RFI", href: "/rfi", icon: MessageCircleQuestion, badge: 8 },
  { label: "Submittals", href: "/submittals", icon: FileCheck2 },
  { label: "Transmittals", href: "/transmittals", icon: Send },
  { label: "Correspondence", href: "/correspondence", icon: Mail },
  { label: "Approvals", href: "/approvals", icon: CheckSquare, badge: 12 },
  { label: "Quality Documents", href: "/quality", icon: ShieldCheck },
  { label: "Safety Documents", href: "/safety", icon: HardHat },
  { label: "Contracts", href: "/contracts", icon: FileSignature },
  { label: "BOQ", href: "/boq", icon: Calculator },
  { label: "Material Approvals", href: "/material-approvals", icon: PackageCheck },
  { label: "Inspection Reports", href: "/inspection-reports", icon: ClipboardCheck },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Recycle Bin", href: "/recycle-bin", icon: Trash2 },
  { label: "Settings", href: "/settings", icon: Settings },
];
