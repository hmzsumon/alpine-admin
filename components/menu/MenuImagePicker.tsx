/* ── Component: MenuImagePicker ────────────────────────────────────────── */
"use client";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { ImagePlus, Loader2, RefreshCw, X } from "lucide-react";
import MenuImage from "@/components/menu/MenuImage";
import ImageUploadProgress from "@/components/menu/ImageUploadProgress";
import { cancelMenuPhoto, uploadMenuPhoto, validateMenuPhotoFile, type ImageUploadProgress as UploadProgress } from "@/lib/menuImages";

type Upload = { id: string; controller: AbortController; cancelled: boolean };
export default function MenuImagePicker({ value, onChange, uploading, setUploading,
  committed, savedImageUrl, onRemoveSaved, disabled }: {
  value: string; onChange: (url: string) => void; uploading: boolean;
  setUploading: (value: boolean) => void; committed: MutableRefObject<boolean>;
  savedImageUrl: string; onRemoveSaved: () => Promise<boolean>; disabled: boolean;
}) {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [removing, setRemoving] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [photo, setPhoto] = useState<{ name: string; size: number } | null>(null);
  const uploadRef = useRef<Upload | null>(null);
  const stagedRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const alive = useRef(true);
  /* ────────── closing an unsaved form cleans only its temporary upload ────────── */
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      const active = uploadRef.current;
      active?.controller.abort();
      const id = active?.id || stagedRef.current;
      if (id && !committed.current) void cancelMenuPhoto(id, true).catch(() => {});
    };
  }, [committed]);

  async function removePhoto() {
    if (removing || disabled) return;
    const active = uploadRef.current;
    if (active) { active.cancelled = true; active.controller.abort(); }
    const id = active?.id || stagedRef.current;
    setRemoving(true); setUploading(true); setError(""); setNotice("");
    try {
      if (id) {
        const result = await cancelMenuPhoto(id);
        stagedRef.current = null; uploadRef.current = null;
        onChange(savedImageUrl);
        setNotice(result.deleted ? "Photo removed from Cloudinary. You can choose another."
          : "Upload cancelled. Cloudinary removal will finish automatically.");
      } else if (value) {
        // Persist removal first: deleting a linked photo would break the saved menu.
        if (!await onRemoveSaved()) throw new Error("Photo was not removed. Reload and retry.");
        onChange(""); setNotice("Photo removed from this item. Unused Cloudinary copies are cleaned automatically.");
      }
      setProgress(null); setPhoto(null);
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Removal failed. Please retry.");
      return false;
    } finally { if (alive.current) { setRemoving(false); setUploading(false); } }
  }

  async function choosePhoto(file: File) {
    if (uploadRef.current || removing || disabled) return;
    try { validateMenuPhotoFile(file); }
    catch (error) { setError(error instanceof Error ? error.message : "Invalid photo"); return; }
    if (stagedRef.current && !await removePhoto()) return;
    if (!alive.current) return;
    const active: Upload = { id: crypto.randomUUID(), controller: new AbortController(), cancelled: false };
    uploadRef.current = active;
    setPhoto({ name: file.name, size: file.size }); setProgress(null); setError(""); setNotice(""); setUploading(true);
    try {
      const url = await uploadMenuPhoto(file, (next) => {
        if (alive.current && !active.cancelled && uploadRef.current === active) setProgress(next);
      }, active.controller.signal, active.id);
      if (active.cancelled || !alive.current) return;
      stagedRef.current = active.id; onChange(url);
    } catch (error) {
      if (alive.current && !active.cancelled) {
        setProgress(null); setError(error instanceof Error ? error.message : "Upload failed");
      }
      if (!active.cancelled) void cancelMenuPhoto(active.id, true).catch(() => {});
    } finally {
      if (uploadRef.current === active && !active.cancelled) {
        uploadRef.current = null;
        if (alive.current) setUploading(false);
      }
    }
  }
  return <div className="menu-image-picker" aria-busy={uploading}>
    <div className="menu-photo-frame">
      <MenuImage src={value} name="Menu image preview" className="menu-image-preview" />
      {(value || photo || uploadRef.current) && <button type="button" className="menu-photo-remove"
        disabled={removing || disabled} onClick={() => void removePhoto()}
        aria-label={uploading ? "Cancel upload and remove photo" : "Remove photo from item and Cloudinary"}
        title={uploading ? "Cancel upload" : "Remove photo"}>
        {removing ? <Loader2 size={15} className="image-upload-spinner" /> : <X size={15} />}
      </button>}
    </div>
    <div className="menu-image-controls">
      <label htmlFor="menu-photo">Item photo <span className="muted">(optional)</span></label>
      <p>No photo? Your item will use the Alpine artwork.</p>
      <input ref={inputRef} id="menu-photo" type="file" hidden accept="image/jpeg,image/png,image/webp"
        disabled={uploading || disabled} aria-describedby="photo-help"
        onChange={(event) => {
          const file = event.target.files?.[0]; event.target.value = "";
          if (file) void choosePhoto(file);
        }} />
      <div className="menu-photo-actions">
        <button type="button" className="secondary" disabled={uploading || disabled}
          onClick={() => inputRef.current?.click()}>
          {value ? <RefreshCw size={14} /> : <ImagePlus size={14} />}{value ? "Replace photo" : "Choose photo"}
        </button>
        {uploading && !removing && <button type="button" className="text-button" disabled={disabled}
          onClick={() => void removePhoto()}><X size={13} /> Cancel upload</button>}
      </div>
      <p id="photo-help">JPG, PNG or WebP · Maximum 5 MB</p>
      {removing ? <p role="status">Removing photo from Cloudinary…</p>
        : progress && photo && <ImageUploadProgress progress={progress} file={photo} />}
      {notice && <p className="menu-photo-notice" role="status">{notice}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  </div>;
}
