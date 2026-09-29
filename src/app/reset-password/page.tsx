"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { requestPasswordReset } from "@/lib/auth";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const success = await requestPasswordReset(email);

    if (!success) {
      setError("We couldn't send the password reset email. Please try again.");
      setLoading(false);
      return;
    }

    setSent(true);
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
            Reset your password
          </h1>
        </div>

        {sent ? (
          <div className="space-y-5 text-center">
            <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              If an account exists for that email address, a password reset link
              has been sent. Please check your inbox.
            </p>
            <a
              href="/login"
              className="block w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Return to sign in
            </a>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <p className="text-sm leading-6 text-slate-600">
              Enter the email address registered to your account and we&apos;ll
              send you a secure link to choose a new password.
            </p>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </p>
            )}

            <a
              href="/login"
              className="block text-center text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
            >
              Back to sign in
            </a>
          </form>
        )}
      </div>
    </main>
  );
}
