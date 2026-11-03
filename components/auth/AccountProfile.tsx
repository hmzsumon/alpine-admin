/* ── Component: AccountProfile ────────────────────────────────────────────── */
"use client";
/* ────────── imports ────────── */
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
/* ────────── profile and password change ────────── */
export default function AccountProfile() {
  const { user, logout } = useAuth();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div className="account-grid">
      <section className="panel account-card">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        <span className="badge Ready">{user.role}</span>
        <h4>Your access</h4>
        <div className="permission-chips">
          {user.permissions.map((p) => (
            <span key={p}>{p}</span>
          ))}
        </div>
      </section>
      <section className="panel account-card">
        <h3>Change password</h3>
        <p>Changing your password signs out all current sessions.</p>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            const form = new FormData(event.currentTarget);
            if (form.get("newPassword") !== form.get("confirmPassword")) {
              setError("New passwords do not match");
              return;
            }
            setBusy(true);
            try {
              const response = await fetch("/api/auth/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  currentPassword: form.get("currentPassword"),
                  newPassword: form.get("newPassword"),
                }),
              });
              const result = await response.json();
              if (!response.ok) throw new Error(result.error);
              await logout();
            } catch (error) {
              setError(
                error instanceof Error
                  ? error.message
                  : "Unable to change password"
              );
              setBusy(false);
            }
          }}
        >
          <label>
            Current password
            <input
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
            />
          </label>
          <label>
            New password
            <input
              name="newPassword"
              type="password"
              required
              minLength={12}
              maxLength={72}
              autoComplete="new-password"
            />
          </label>
          <label>
            Confirm new password
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={12}
              maxLength={72}
              autoComplete="new-password"
            />
          </label>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <button disabled={busy} className="primary">
            Change password
          </button>
        </form>
      </section>
    </div>
  );
}
