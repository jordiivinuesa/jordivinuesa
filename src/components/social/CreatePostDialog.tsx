import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ImagePlus, Loader2 } from "lucide-react";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (file: File, caption: string, isPublic: boolean) => Promise<any>;
}

const CreatePostDialog = ({ open, onOpenChange, onSubmit }: CreatePostDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(selected);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setSubmitting(true);
    const result = await onSubmit(file, caption, isPublic);
    setSubmitting(false);
    if (result) {
      setFile(null);
      setPreview(null);
      setCaption("");
      setIsPublic(true);
      onOpenChange(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setCaption("");
    setIsPublic(true);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display">Nueva publicación</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image picker */}
          {preview ? (
            <div className="relative">
              <img src={preview} className="w-full aspect-square rounded-xl object-cover" />
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="absolute top-2 right-2 h-7 w-7 flex items-center justify-center rounded-full bg-background/80 text-foreground text-xs"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm">Seleccionar foto</span>
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Caption */}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Escribe una descripción..."
            rows={3}
            className="w-full resize-none rounded-xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />

          {/* Public toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Publicación pública</span>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!file || submitting}
            className="w-full rounded-xl"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publicando...
              </>
            ) : (
              "Publicar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;
