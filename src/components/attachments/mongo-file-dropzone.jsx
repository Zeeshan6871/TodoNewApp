"use client";

import { useState, useRef } from "react";
import { UploadCloud, File, Image as ImageIcon, FileText, AlertCircle, Loader2 } from "lucide-react";
import { formatFileSize } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "application/pdf",
];

export function MongoFileDropzone({ taskId, onUploadSuccess, disabled = false }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setError("");

    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`"${file.name}" is not supported. Please upload PNG, JPG, WebP, SVG or PDF.`);
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the 4MB limit (${formatFileSize(file.size)}).`);
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`/api/tasks/${taskId}/attachments`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "Upload failed");
        }

        if (onUploadSuccess) {
          onUploadSuccess(data.attachment);
        }
      } catch (err) {
        setError(err.message || "Failed to upload file to Cloud");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled && !uploading) setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled && !uploading) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 select-none",
          dragOver
            ? "border-primary bg-primary/10 scale-[1.01]"
            : "border-border hover:border-primary/50 hover:bg-muted/40 bg-card/50",
          (disabled || uploading) && "opacity-60 cursor-not-allowed pointer-events-none"
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFiles(e.target.files)}
          accept=".png,.jpg,.jpeg,.webp,.svg,.pdf"
          multiple
          className="hidden"
          disabled={disabled || uploading}
        />

        <div className="flex flex-col items-center justify-center gap-2">
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-xs font-medium text-foreground">Storing file into Cloud...</p>
            </>
          ) : (
            <>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  <span className="text-primary hover:underline font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Images (PNG, JPG, WebP, SVG) or Documents (PDF) up to 4MB</p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

