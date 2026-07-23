import { FileText, FileSpreadsheet, FileImage, FileVideo, FileCode2, File } from "lucide-react";
import { cn } from "@/lib/utils";

function getExt(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

const EXT_STYLES: Record<string, { icon: typeof FileText; className: string; label: string }> = {
  pdf: { icon: FileText, className: "bg-red-500/10 text-red-600 dark:text-red-400", label: "PDF" },
  xlsx: { icon: FileSpreadsheet, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", label: "XLS" },
  xls: { icon: FileSpreadsheet, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", label: "XLS" },
  dwg: { icon: FileCode2, className: "bg-blue-500/10 text-blue-600 dark:text-blue-400", label: "DWG" },
  dxf: { icon: FileCode2, className: "bg-blue-500/10 text-blue-600 dark:text-blue-400", label: "DXF" },
  docx: { icon: FileText, className: "bg-sky-500/10 text-sky-600 dark:text-sky-400", label: "DOC" },
  jpg: { icon: FileImage, className: "bg-purple-500/10 text-purple-600 dark:text-purple-400", label: "IMG" },
  png: { icon: FileImage, className: "bg-purple-500/10 text-purple-600 dark:text-purple-400", label: "IMG" },
  mp4: { icon: FileVideo, className: "bg-pink-500/10 text-pink-600 dark:text-pink-400", label: "MP4" },
};

export function DocIcon({ fileName, className }: { fileName: string; className?: string }) {
  const ext = getExt(fileName);
  const style = EXT_STYLES[ext] ?? { icon: File, className: "bg-muted text-muted-foreground", label: ext.toUpperCase() };
  const Icon = style.icon;

  return (
    <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", style.className, className)}>
      <Icon className="size-4.5" />
    </div>
  );
}

export function docTypeLabel(fileName: string) {
  const ext = getExt(fileName);
  return EXT_STYLES[ext]?.label ?? ext.toUpperCase();
}
