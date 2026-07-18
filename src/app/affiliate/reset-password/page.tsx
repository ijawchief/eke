"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AfricanVillageBackground } from "@/components/AfricanVillageBackground";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const router = useRouter();

  const [password, setPassword]         = useState("");
  const [confirm, setConfirm]           = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [done, setDone]                 = useState(false);
  const [error, setError]               = useState("");

  if (!token) {
    return (
      <div className="text-center space-y-3">
        <p className="text-red-600 font-semibold">Invalid reset link</p>
        <Link href="/affiliate/forgot-password" className="text-sm text-emerald-600 hover:underline">Request a new one</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/affiliate/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const d = await res.json();
    setLoading(false);
    if (res.ok) { setDone(true); setTimeout(() => router.push("/affiliate/login"), 2500); }
    else setError(d.error ?? "Something went wrong");
  };

  if (done) {
    return (
      <div className="text-center space-y-3">
        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={24} className="text-green-600" />
        </div>
        <p className="font-semibold text-gray-800">Password updated!</p>
        <p className="text-sm text-gray-400">Redirecting you to login…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[
        { label: "New Password", val: password, set: setPassword, show: showPassword, toggle: () => setShowPassword(v => !v) },
        { label: "Confirm Password", val: confirm, set: setConfirm, show: showConfirm, toggle: () => setShowConfirm(v => !v) },
      ].map(({ label, val, set, show, toggle }) => (
        <div key={label}>
          <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={val}
              onChange={(e) => set(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              placeholder="••••••••"
              minLength={8}
              required
            />
            <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      ))}
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2.5">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-sm"
      >
        {loading ? "Saving…" : "Set New Password"}
      </button>
    </form>
  );
}

export default function AffiliateResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fff7ed] relative overflow-hidden">
      <AfricanVillageBackground />
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-sm relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Veelage</h1>
          <p className="text-gray-400 text-sm mt-1">Choose a new password</p>
        </div>
        <Suspense>
          <ResetForm />
        </Suspense>
      </div>
    </main>
  );
}
