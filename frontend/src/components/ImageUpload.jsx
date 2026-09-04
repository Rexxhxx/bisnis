import { useState, useRef } from "react";
import { toast } from "sonner";
import { UploadCloud, Loader2, X } from "lucide-react";
import api, { apiError } from "@/lib/api";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export function ImageUpload({ value, onChange, label = "Gambar", testId }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const preview = value && !/^https?:\/\//i.test(value) && !value.startsWith("data:") ? `${BACKEND_URL}${value}` : value;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      onChange(data.url);
      toast.success("Gambar berhasil diupload");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      <div className="flex items-center gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
          {value ? (
            <>
              <img src={preview} alt="preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <UploadCloud className="h-6 w-6" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} data-testid={testId ? `${testId}-input` : undefined} />
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            data-testid={testId}
          >
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            {value ? "Ganti Gambar" : "Upload Gambar"}
          </Button>
          <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WEBP · maks 5MB</p>
        </div>
      </div>
    </div>
  );
}
