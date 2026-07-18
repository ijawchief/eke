"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, AlertCircle, Mail, Building2, ArrowRight } from "lucide-react";

interface Bank { name: string; code: string }

interface Props {
  creatorId: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

export function OnboardingClient({ email, name, emailVerified }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "bank">(emailVerified ? "bank" : "email");

  // Email step
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [emailVerifiedLocal, setEmailVerifiedLocal] = useState(emailVerified);

  // Bank step
  const [phone, setPhone] = useState("");
  const [bvn, setBvn] = useState("");
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [bankError, setBankError] = useState("");

  const resolveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/creator/banks")
      .then((r) => r.json())
      .then((data: Bank[]) => setBanks(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (resolveTimer.current) clearTimeout(resolveTimer.current);
    setAccountName("");
    setResolveError("");
    if (accountNumber.length === 10 && bankCode) {
      setResolving(true);
      resolveTimer.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `/api/creator/resolve-account?account_number=${accountNumber}&bank_code=${bankCode}`
          );
          const data = await res.json();
          if (res.ok) {
            setAccountName(data.account_name);
          } else {
            setResolveError("Account not found — check number and bank");
          }
        } catch {
          setResolveError("Could not verify account");
        } finally {
          setResolving(false);
        }
      }, 500);
    }
    return () => { if (resolveTimer.current) clearTimeout(resolveTimer.current); };
  }, [accountNumber, bankCode]);

  const handleSendOtp = async () => {
    setSendingOtp(true);
    setOtpError("");
    const res = await fetch("/api/creator/send-otp", { method: "POST" });
    if (res.ok) {
      setOtpSent(true);
    } else {
      const d = await res.json();
      setOtpError(d.error ?? "Failed to send code");
    }
    setSendingOtp(false);
  };

  const handleVerifyOtp = async () => {
    setVerifyingOtp(true);
    setOtpError("");
    const res = await fetch("/api/creator/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp }),
    });
    if (res.ok) {
      setEmailVerifiedLocal(true);
      setStep("bank");
    } else {
      const d = await res.json();
      setOtpError(d.error ?? "Incorrect code");
    }
    setVerifyingOtp(false);
  };

  const handleBankChange = (code: string) => {
    setBankCode(code);
    const b = banks.find((b) => b.code === code);
    setBankName(b?.name ?? "");
  };

  const handleSaveBank = async () => {
    if (!phone.trim()) { setBankError("Phone number is required"); return; }
    if (!bankCode || !accountNumber || !accountName) {
      setBankError("Select a bank and enter a valid account number");
      return;
    }
    setSaving(true);
    setBankError("");
    const res = await fetch("/api/creator/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, bvn, bank_name: bankName, bank_code: bankCode, account_number: accountNumber, account_name: accountName }),
    });
    if (res.ok) {
      router.push("/creator/dashboard");
    } else {
      const d = await res.json();
      setBankError(d.error ?? "Failed to save");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">
            Welcome{name ? `, ${name}` : ""}!
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Complete your account setup to start withdrawing
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            step === "email" ? "bg-orange-600 text-white" : "bg-white text-green-600 border border-green-200"
          }`}>
            {emailVerifiedLocal ? <CheckCircle size={15} /> : <Mail size={15} />}
            Verify Email
          </div>
          <ArrowRight size={16} className="text-gray-300 flex-shrink-0" />
          <div className={`flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            step === "bank" ? "bg-orange-600 text-white" : "bg-white text-gray-400 border border-gray-200"
          }`}>
            <Building2 size={15} />
            Bank Details
          </div>
        </div>

        {/* Email verification step */}
        {step === "email" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-1">Verify your email</h2>
            <p className="text-gray-400 text-sm mb-6">
              We&apos;ll send a 6-digit code to <span className="font-semibold text-gray-600">{email}</span>
            </p>

            {!otpSent ? (
              <button
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
              >
                {sendingOtp ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
                {sendingOtp ? "Sending…" : "Send verification code"}
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-green-600 bg-green-50 rounded-xl px-4 py-2.5">
                  Code sent! Check your inbox.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Enter 6-digit code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                  />
                </div>
                {otpError && (
                  <p className="text-red-500 text-sm">{otpError}</p>
                )}
                <button
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp || otp.length !== 6}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {verifyingOtp ? <Loader2 size={15} className="animate-spin" /> : null}
                  {verifyingOtp ? "Verifying…" : "Verify Code"}
                </button>
                <button
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="w-full text-gray-400 hover:text-gray-600 text-sm transition-colors"
                >
                  Resend code
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bank details step */}
        {step === "bank" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <h2 className="font-bold text-gray-900 mb-1">Bank & contact details</h2>
              <p className="text-gray-400 text-sm">
                These are required to process your withdrawals.
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="08012345678"
              />
            </div>

            {/* BVN */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                BVN{" "}
                <span className="font-normal text-gray-400">(optional — speeds up payouts)</span>
              </label>
              <input
                type="text"
                value={bvn}
                onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="22212345678"
                maxLength={11}
              />
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Bank Account
              </p>

              {/* Bank dropdown */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Bank</label>
                <select
                  value={bankCode}
                  onChange={(e) => handleBankChange(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">Select bank…</option>
                  {banks.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account number */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="0123456789"
                  maxLength={10}
                />
              </div>

              {/* Account name — auto-resolved */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Account Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={accountName}
                    readOnly
                    className="w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-700 border-gray-200 cursor-default"
                    placeholder={
                      resolving
                        ? "Verifying…"
                        : resolveError
                        ? resolveError
                        : "Auto-filled after account number entry"
                    }
                  />
                  {resolving && (
                    <Loader2 size={14} className="absolute right-3 top-3 text-orange-500 animate-spin" />
                  )}
                  {!resolving && accountName && (
                    <CheckCircle size={14} className="absolute right-3 top-3 text-green-500" />
                  )}
                  {!resolving && resolveError && (
                    <AlertCircle size={14} className="absolute right-3 top-3 text-red-400" />
                  )}
                </div>
                {resolveError && <p className="text-red-400 text-xs mt-1">{resolveError}</p>}
                {accountName && (
                  <p className="text-green-600 text-xs mt-1 font-medium">✓ Verified: {accountName}</p>
                )}
              </div>
            </div>

            {bankError && (
              <div className="bg-red-50 text-red-600 text-sm rounded-xl px-3 py-2.5">
                {bankError}
              </div>
            )}

            <button
              onClick={handleSaveBank}
              disabled={saving || !accountName || resolving}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : null}
              {saving ? "Saving…" : "Complete Setup"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
