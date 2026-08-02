"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { AfricanVillageBackground } from "@/components/AfricanVillageBackground";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      window.location.href = data.redirect;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fff7ed] relative overflow-hidden">
      <AfricanVillageBackground />
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-sm relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Veelage</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Email or Username
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              placeholder="your@email.com or username"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}
          <div className="text-right -mt-1">
            <Link
              href="/forgot-password"
              className="text-xs text-orange-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p className="text-center text-xs text-gray-300 mt-6">Veelage</p>
      </div>
    </main>
  );
}
