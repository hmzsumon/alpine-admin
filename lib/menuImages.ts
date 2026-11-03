/* ────────── image transfer stages ────────── */
export type ImageUploadProgress = {
  stage: "preparing" | "uploading" | "processing" | "complete";
  percent: number | null;
};

/* ────────── validate before discarding a previous selection ────────── */
export function validateMenuPhotoFile(file: File): void {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    !file.size || file.size > 5 * 1024 * 1024)
    throw new Error("Choose a JPG, PNG or WebP image up to 5 MB.");
}
/* ────────── upload selected local photo through the authenticated API ────────── */
export async function uploadMenuPhoto(
  file: File,
  onProgress?: (progress: ImageUploadProgress) => void,
  signal?: AbortSignal,
  uploadId?: string,
): Promise<string> {
  validateMenuPhotoFile(file);
  if (signal?.aborted) throw new DOMException("Upload cancelled", "AbortError");
  onProgress?.({ stage: "preparing", percent: null });
  const image = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    const cancel = () => reader.abort();
    const cleanup = () => signal?.removeEventListener("abort", cancel);
    reader.onload = () => { cleanup(); resolve(String(reader.result)); };
    reader.onerror = () => { cleanup(); reject(new Error("Could not read this photo.")); };
    reader.onabort = () => { cleanup(); reject(new DOMException("Upload cancelled", "AbortError")); };
    signal?.addEventListener("abort", cancel, { once: true });
    reader.readAsDataURL(file);
  });
  if (signal?.aborted) throw new DOMException("Upload cancelled", "AbortError");

  /* ────────── actual browser transfer progress, followed by server processing ────────── */
  return new Promise<string>((resolve, reject) => {
    const request = new XMLHttpRequest();
    const cancel = () => request.abort();
    request.open("POST", "/api/menu-images");
    request.setRequestHeader("Content-Type", "application/json");
    request.responseType = "json";
    request.timeout = 75000;
    request.upload.onprogress = (event) => onProgress?.({
      stage: "uploading",
      percent: event.lengthComputable && event.total > 0
        ? Math.min(100, Math.round(event.loaded / event.total * 100)) : null,
    });
    // Transfer completion is not Cloudinary success: keep the processing stage indeterminate.
    request.upload.onload = () => onProgress?.({ stage: "processing", percent: null });
    request.onload = () => {
      const result = request.response;
      if (request.status < 200 || request.status >= 300 || typeof result?.imageUrl !== "string") {
        reject(new Error(result?.error || "Image upload failed. Please retry."));
        return;
      }
      onProgress?.({ stage: "complete", percent: 100 });
      resolve(result.imageUrl);
    };
    request.onerror = () => reject(new Error("Connection interrupted. Please retry the upload."));
    request.ontimeout = () => reject(new Error("Upload timed out. Please retry."));
    request.onabort = () => reject(new DOMException("Upload cancelled", "AbortError"));
    request.onloadend = () => signal?.removeEventListener("abort", cancel);
    signal?.addEventListener("abort", cancel, { once: true });
    onProgress?.({ stage: "uploading", percent: 0 });
    request.send(JSON.stringify({ image, ...(uploadId ? { uploadId } : {}) }));
  });
}

/* ────────── durable cancellation, including an upload which responds late ────────── */
export async function cancelMenuPhoto(uploadId: string, keepalive = false): Promise<{ deleted: boolean; cleanupPending: boolean }> {
  const response = await fetch("/api/menu-images/" + encodeURIComponent(uploadId), { method: "DELETE", keepalive });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Could not remove this photo. Please retry removal.");
  return result;
}
