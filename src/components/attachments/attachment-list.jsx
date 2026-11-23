"use client";

import { FileText, Image as ImageIcon, Download, Trash2, Eye } from "lucide-react";
import { formatFileSize, formatDateShort } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";

export function AttachmentList({ attachments = [], onPreview, onDelete, readOnly = false }) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Attachments ({attachments.length})
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {attachments.map((att) => {
          const isPdf = att.mimeType === "application/pdf";
          const isImage = att.mimeType?.startsWith("image/");
          const fileUrl = `/api/attachments/${att.id}`;

          return (
            <div
              key={att.id}
              className="group flex items-center justify-between p-2.5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-all duration-150"
            >
              <div
                className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                onClick={() => onPreview && onPreview(att)}
              >
                <div
                  className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isPdf ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                  }`}
                >
                  {isPdf ? <FileText className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {att.originalName}
                  </p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <span>{formatFileSize(att.size)}</span>
                    <span>•</span>
                    <span className="uppercase text-[10px] px-1 rounded bg-muted">
                      {isPdf ? "PDF" : att.mimeType?.split("/")[1] || "IMG"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="iconSm"
                  onClick={() => onPreview && onPreview(att)}
                  title="Preview"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>

                <a
                  href={fileUrl}
                  download={att.originalName}
                  target="_blank"
                  rel="noreferrer"
                  title="Download"
                  className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>

                {!readOnly && onDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="iconSm"
                    onClick={() => onDelete(att.id)}
                    title="Delete attachment"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

