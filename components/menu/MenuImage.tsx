/* ── Component: MenuImage ────────────────────────────────────────────── */
"use client";
import { useState } from "react";
export const DEFAULT_MENU_IMAGE = "/images/alpine-menu-default.svg";

export default function MenuImage({ src, name, className = "menu-image" }: {
  src?: string; name: string; className?: string;
}) {
  const [failed, setFailed] = useState<string>();
  const image = src && failed !== src ? src : DEFAULT_MENU_IMAGE;
  // A broken or unreachable photo falls back to the bundled restaurant artwork.
  return <img src={image} alt={src && failed !== src ? name : "Alpine Restaurant"}
    className={className} width={80} height={60} loading="lazy"
    onError={() => { if (image !== DEFAULT_MENU_IMAGE) setFailed(src); }} />;
}
