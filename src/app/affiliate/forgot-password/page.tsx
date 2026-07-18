"use client";

import { useState } from "react";
import Link from "next/link";
import { AfricanVillageBackground } from "@/components/AfricanVillageBackground";
import { ArrowLeft, Mail } from "lucide-react";

export default function AffiliateForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/affiliate/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) { setSent(true); } else {
      const d = await res.json();
      setError(d.error ?? "Something went wrong");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fff7ed] relative overflow-hidden">
      <AfricanVillageBackground />
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-sm relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Veelage</h1>
          <p className="text-gray-400 text-sm mt-1">Reset your affiliate password</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
              <Mail size={24} className="text-emerald-600" />
            </div>
            <p className="font-semibold text-gray-800">Check your inbox</p>
            <p className="text-sm text-gray-400">
              If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
            </p>
            <Link href="/affiliate/login" className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:underline font-semibold mt-2">
              <ArrowLeft size={14} /> Back to login
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-500">Enter your affiliate account email and we&apos;ll send you a reset link.</p>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  placeholder="you@example.com"
                  required
                />
              </div>
              {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2.5">{error}</div>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-sm"
              >
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>
            <Link href="/affiliate/login" className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mt-5 transition-colors">
              <ArrowLeft size={13} /> Back to login
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
