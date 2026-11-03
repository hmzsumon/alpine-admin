/* ── Component: ImageUploadProgress ────────────────────────────────────── */
import { CheckCircle2, CloudUpload, Loader2 } from "lucide-react";
import type { ImageUploadProgress as UploadProgress } from "@/lib/menuImages";

export default function ImageUploadProgress({ progress, file }: {
  progress: UploadProgress;
  file: { name: string; size: number };
}) {
  const complete = progress.stage === "complete";
  const indeterminate = progress.percent === null;
  const label = {
    preparing: "Preparing photo…",
    uploading: "Uploading to server…",
    processing: "Processing image…",
    complete: "Photo uploaded",
  }[progress.stage];
  return <div className={`image-upload-status ${complete ? "is-complete" : ""}`}>
    <div className="image-upload-file">
      <CloudUpload size={17} aria-hidden="true" />
      <span title={file.name}>{file.name}</span>
      <small>{(file.size / (1024 * 1024)).toFixed(2)} MB</small>
    </div>
    <div className="image-upload-label">
      <span role="status">{complete ? <CheckCircle2 size={14} aria-hidden="true" />
        : <Loader2 size={14} className="image-upload-spinner" aria-hidden="true" />}{label}</span>
      {!indeterminate && <strong>{progress.percent}%</strong>}
    </div>
    <div className={`image-upload-track ${indeterminate ? "is-indeterminate" : ""}`}
      role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100}
      aria-valuenow={progress.percent ?? undefined} aria-valuetext={indeterminate ? label : `${progress.percent}%`}>
      <div className="image-upload-fill" style={{ width: indeterminate ? "36%" : `${progress.percent}%` }} />
    </div>
    <p>{complete ? "Preview is ready. Save the item to apply this photo."
      : progress.stage === "processing" ? "Finishing your photo. Please keep this form open."
      : "Your photo is on its way. Please keep this form open."}</p>
  </div>;
}
