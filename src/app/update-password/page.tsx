"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { updatePassword } from "@/lib/auth";

export default function UpdatePasswordPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (mounted && data.session) {
        setReady(true);
      }
    }

    void checkSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(event => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Your new password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    const user = await updatePassword(password);

    if (!user) {
      setError(
        "We couldn't update your password. Please request a new reset link and try again."
      );
      setLoading(false);
      return;
    }

    setUpdated(true);
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/nae-logo-cropped.png"
            alt="Nord Anglia Education"
            width={319}
            height={70}
            className="mb-5 h-auto w-64"
            priority
          />
          <h1 className="text-2xl font-bold text-slate-900">
            Set a new password
          </h1>
        </div>

        {updated ? (
          <div className="space-y-5 text-center">
            <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              Your password has been updated successfully.
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Continue to Knowledge Hub
            </button>
          </div>
        ) : !ready ? (
          <div className="space-y-4 text-center">
            <p className="text-sm leading-6 text-slate-600">
              This password reset link is invalid or has expired.
            </p>
            <a
              href="/reset-password"
              className="block w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Request a new link
            </a>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <p className="text-sm leading-6 text-slate-600">
              Choose a new password for your account.
            </p>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                New password
              </label>
              <input
                id="password"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                type="password"
                autoComplete="new-password"
                placeholder="Enter your new password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirmation"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Confirm new password
              </label>
              <input
                id="confirmation"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                type="password"
                autoComplete="new-password"
                placeholder="Enter your new password again"
                value={confirmation}
                onChange={event => setConfirmation(event.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update password"}
            </button>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
