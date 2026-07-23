"use client";

import * as React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ChevronLeft, ChevronRight, FileWarning, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PdfPreview({ fileUrl }: { fileUrl: string }) {
  const [numPages, setNumPages] = React.useState<number | null>(null);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [failed, setFailed] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(300);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (failed) {
    return (
      <div className="rounded-xl border border-border bg-muted/40 aspect-[4/3] flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <FileWarning className="size-8" />
        <p className="text-xs px-4 text-center">Preview unavailable — file not found in demo storage</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="rounded-xl border border-border bg-muted/40 overflow-hidden">
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages: n }) => setNumPages(n)}
        onLoadError={() => setFailed(true)}
        loading={
          <div className="aspect-[4/3] flex items-center justify-center text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        }
        error={
          <div className="aspect-[4/3] flex items-center justify-center text-muted-foreground">
            <FileWarning className="size-8" />
          </div>
        }
      >
        <Page pageNumber={pageNumber} width={width} loading={null} />
      </Document>

      {numPages && numPages > 1 && (
        <div className="flex items-center justify-between gap-2 px-2 py-1.5 border-t border-border/60 bg-card">
          <Button
            variant="ghost"
            size="icon-xs"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((p) => p - 1)}
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {pageNumber} of {numPages}
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber((p) => p + 1)}
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
