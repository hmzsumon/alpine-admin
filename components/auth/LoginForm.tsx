/* ── Component: LoginForm ────────────────────────────────────────────── */
"use client";
/* ────────── imports ────────── */
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  UtensilsCrossed,
} from "lucide-react";

/* ────────── restaurant staff sign in ────────── */
export default function LoginForm() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [show, setShow] = useState(false);
  const router = useRouter();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to sign in");
      router.replace(result.redirect);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Sign-in failed");
      setBusy(false);
    }
  }
  return (
    <main className="login-screen">
      <section className="login-story">
        <div className="login-brand">
          <span className="brand-mark">
            <UtensilsCrossed size={28} />
          </span>
          <div>
            ALPINE<small>RESTAURANT</small>
          </div>
        </div>
        <span className="eyebrow">CHOWHATTA · SYLHET</span>
        <h1>
          Great service.
          <br />
          Connected kitchens.
          <br />
          <em>One Alpine.</em>
        </h1>
        <p>
          Your restaurant’s operations, people and daily accounts — together in
          one workspace.
        </p>
        <div className="login-stations">
          <span>Main Kitchen</span>
          <span>BBQ</span>
          <span>Drinks & Dessert</span>
        </div>
        <small>Alpine Restaurant · Staff workspace</small>
      </section>
      <section className="login-card">
        <span className="login-lock">
          <LockKeyhole size={24} />
        </span>
        <span className="eyebrow">WELCOME BACK</span>
        <h2>Sign in to your workspace</h2>
        <p>Use the account provided by your restaurant owner.</p>
        <form onSubmit={submit}>
          <label>
            Email address
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              placeholder="you@alpine.com"
              maxLength={254}
            />
          </label>
          <label>
            Password
            <div className="password-field">
              <input
                name="password"
                type={show ? "text" : "password"}
                required
                autoComplete="current-password"
                maxLength={128}
                placeholder="Enter your password"
              />
              <button
                type="button"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button disabled={busy} className="primary login-submit">
            {busy ? "Signing in…" : "Sign in"}
            <ArrowRight size={18} />
          </button>
        </form>
        <div className="login-security">
          <LockKeyhole size={13} /> Secure staff access · Permissions follow
          your role
        </div>
        <p className="login-help">
          Need an account or password reset? Contact your restaurant owner.
        </p>
      </section>
    </main>
  );
}
