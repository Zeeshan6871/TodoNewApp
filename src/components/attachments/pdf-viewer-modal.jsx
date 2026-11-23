"use client";

import { X, Download, ExternalLink, FileText } from "lucide-react";
import { formatFileSize } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";

export function PdfViewerModal({ attachment, onClose }) {
  if (!attachment) return null;

  const fileUrl = `/api/attachments/${attachment.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[90vh] bg-card text-card-foreground border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="h-8 w-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate text-foreground">{attachment.originalName}</h3>
              <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)} • PDF Document</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-background hover:bg-muted text-foreground transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              New Tab
            </a>
            <a
              href={fileUrl}
              download={attachment.originalName}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
            <Button variant="ghost" size="iconSm" onClick={onClose} title="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Embedded PDF iframe */}
        <div className="flex-1 w-full bg-slate-900/5 dark:bg-black/40">
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=0`}
            title={attachment.originalName}
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
}

