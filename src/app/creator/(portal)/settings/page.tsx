"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

interface Bank { name: string; code: string }

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition ${props.className ?? ""}`}
    />
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-4 border-b border-gray-50 last:border-0">
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function CreatorSettingsPage() {
  const router = useRouter();

  // Profile
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  // Bank
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");
  const [bankSaving, setBankSaving] = useState(false);
  const [bankSaved, setBankSaved] = useState(false);
  const [bankError, setBankError] = useState("");
  const resolveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load current profile
  useEffect(() => {
    fetch("/api/creator/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setName(d.name ?? "");
        setEmail(d.email ?? "");
        setPhone(d.phone ?? "");
        setBankCode(d.bank_code ?? "");
        setBankName(d.bank_name ?? "");
        setAccountNumber(d.account_number ?? "");
        setAccountName(d.account_name ?? "");
      })
      .catch(() => {});
    fetch("/api/creator/banks")
      .then((r) => r.json())
      .then((d: Bank[]) => setBanks(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // Auto-resolve bank account
  useEffect(() => {
    if (resolveTimer.current) clearTimeout(resolveTimer.current);
    setResolveError("");
    if (accountNumber.length === 10 && bankCode) {
      setResolving(true);
      resolveTimer.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/creator/resolve-account?account_number=${accountNumber}&bank_code=${bankCode}`);
          const data = await res.json();
          if (res.ok) setAccountName(data.account_name);
          else setResolveError("Account not found");
        } catch { setResolveError("Could not verify account"); }
        finally { setResolving(false); }
      }, 500);
    } else if (accountNumber.length !== 10) {
      setAccountName("");
    }
    return () => { if (resolveTimer.current) clearTimeout(resolveTimer.current); };
  }, [accountNumber, bankCode]);

  const handleBankChange = (code: string) => {
    setBankCode(code);
    const b = banks.find((b) => b.code === code);
    setBankName(b?.name ?? "");
    setAccountName("");
  };

  const saveProfile = async () => {
    setSaving(true); setProfileError(""); setProfileSaved(false);
    const res = await fetch("/api/creator/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, phone }),
    });
    const data = await res.json();
    if (!res.ok) { setProfileError(data.error ?? "Failed to save"); }
    else { setProfileSaved(true); setTimeout(() => setProfileSaved(false), 3000); router.refresh(); }
    setSaving(false);
  };

  const savePassword = async () => {
    setPwError(""); setPwSaved(false);
    if (!currentPw || !newPw || !confirmPw) { setPwError("All fields required"); return; }
    if (newPw !== confirmPw) { setPwError("Passwords don't match"); return; }
    if (newPw.length < 8) { setPwError("At least 8 characters"); return; }
    setPwSaving(true);
    const res = await fetch("/api/creator/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
    });
    const data = await res.json();
    if (!res.ok) setPwError(data.error ?? "Failed");
    else { setPwSaved(true); setCurrentPw(""); setNewPw(""); setConfirmPw(""); setTimeout(() => setPwSaved(false), 3000); }
    setPwSaving(false);
  };

  const saveBankDetails = async () => {
    if (!bankCode || !accountNumber || !accountName) { setBankError("Complete bank details required"); return; }
    setBankSaving(true); setBankError(""); setBankSaved(false);
    const res = await fetch("/api/creator/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ bank_name: bankName, bank_code: bankCode, account_number: accountNumber, account_name: accountName }),
    });
    const data = await res.json();
    if (!res.ok) setBankError(data.error ?? "Failed");
    else { setBankSaved(true); setTimeout(() => setBankSaved(false), 3000); }
    setBankSaving(false);
  };

  const card = "bg-white rounded-2xl shadow-sm overflow-hidden mb-5";
  const cardHeader = "px-5 sm:px-6 py-4 border-b border-gray-100 font-semibold text-gray-800";
  const cardBody = "px-5 sm:px-6 py-2";

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account details</p>
      </div>

      {/* Profile */}
      <div className={card}>
        <div className={cardHeader}>Profile</div>
        <div className={cardBody}>
          <Field label="Full Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </Field>
          <Field label="Email Address">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            <p className="text-xs text-amber-600 mt-1">Changing your email will require re-verification.</p>
          </Field>
          <Field label="Phone Number">
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" />
          </Field>
          {profileError && <p className="text-red-500 text-sm pb-3">{profileError}</p>}
          <div className="py-4">
            <button onClick={saveProfile} disabled={saving}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              {saving ? <Loader2 size={14} className="animate-spin" /> : profileSaved ? <CheckCircle size={14} /> : null}
              {saving ? "Saving…" : profileSaved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Password */}
      <div className={card}>
        <div className={cardHeader}>Change Password</div>
        <div className={cardBody}>
          <Field label="Current Password">
            <div className="relative">
              <Input type={showPw ? "text" : "password"} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" className="pr-10" />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
          <Field label="New Password">
            <Input type={showPw ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min 8 characters" />
          </Field>
          <Field label="Confirm New Password">
            <Input type={showPw ? "text" : "password"} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Repeat new password" />
          </Field>
          {pwError && <p className="text-red-500 text-sm pb-2">{pwError}</p>}
          {pwSaved && <p className="text-green-600 text-sm pb-2 flex items-center gap-1"><CheckCircle size={13} /> Password updated</p>}
          <div className="py-4">
            <button onClick={savePassword} disabled={pwSaving}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              {pwSaving ? <Loader2 size={14} className="animate-spin" /> : null}
              {pwSaving ? "Updating…" : "Update Password"}
            </button>
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className={card}>
        <div className={cardHeader}>Bank Account</div>
        <div className={cardBody}>
          <Field label="Bank">
            <select value={bankCode} onChange={(e) => handleBankChange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400">
              <option value="">Select bank…</option>
              {banks.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
            </select>
          </Field>
          <Field label="Account Number">
            <Input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))} placeholder="0123456789" maxLength={10} />
          </Field>
          <Field label="Account Name">
            <div className="relative">
              <Input readOnly value={accountName} className="bg-gray-50 cursor-default"
                placeholder={resolving ? "Verifying…" : resolveError || "Auto-filled from account number"} />
              {resolving && <Loader2 size={13} className="absolute right-3 top-3 text-orange-500 animate-spin" />}
              {!resolving && accountName && <CheckCircle size={13} className="absolute right-3 top-3 text-green-500" />}
              {!resolving && resolveError && <AlertCircle size={13} className="absolute right-3 top-3 text-red-400" />}
            </div>
            {resolveError && <p className="text-red-400 text-xs mt-1">{resolveError}</p>}
            {accountName && <p className="text-green-600 text-xs mt-1">✓ {accountName}</p>}
          </Field>
          {bankError && <p className="text-red-500 text-sm pb-2">{bankError}</p>}
          {bankSaved && <p className="text-green-600 text-sm pb-2 flex items-center gap-1"><CheckCircle size={13} /> Bank details saved</p>}
          <div className="py-4">
            <button onClick={saveBankDetails} disabled={bankSaving || resolving || (!accountName && !resolveError)}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              {bankSaving ? <Loader2 size={14} className="animate-spin" /> : bankSaved ? <CheckCircle size={14} /> : null}
              {bankSaving ? "Saving…" : bankSaved ? "Saved!" : "Save Bank Details"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
