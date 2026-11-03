/* ── Component: CategoryForm ────────────────────────────────────────────── */
"use client";

/* ────────── imports ────────── */
import { useState } from "react";
import { useAdminContext } from "@/context/AdminContext";

export default function CategoryForm() {
  const { data, categories, save, busy, mode, setModal, setNotice, setCategory } = useAdminContext();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  /* ────────── save empty categories independently of menu items ────────── */
  return (
    <form onSubmit={async (event) => {
      event.preventDefault();
      const value = name.trim();
      if (!value || value.length > 100) {
        setError("Enter a category name (1–100 characters).");
        return;
      }
      if (value.toLowerCase() === "all categories" ||
        categories.some((category) => category.toLowerCase() === value.toLowerCase())) {
        setError("This category already exists. Choose a different name.");
        return;
      }
      if (await save({ ...data, categories: [...(data.categories || []), value] })) {
        setCategory(value);
        setModal(null);
        setNotice("Category added. You can now add items to it.");
      }
    }}>
      <label htmlFor="category-name">Category name *</label>
      <input id="category-name" name="category" required maxLength={100}
        value={name} placeholder="e.g. Chef's specials"
        aria-invalid={!!error} aria-describedby={error ? "category-error" : "category-help"}
        onChange={(event) => { setName(event.target.value); setError(""); }} />
      <p id="category-help">The category will be available in menu filters and the item form.</p>
      {error && <p id="category-error" className="form-error" role="alert">{error}</p>}
      <button type="submit" className="primary" disabled={busy || mode !== "database"}>
        {busy ? "Saving…" : "Save category"}
      </button>
    </form>
  );
}
