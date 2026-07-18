"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Pencil, CheckCircle, Loader2, AlertCircle, Eye, EyeOff, X } from "lucide-react";

interface Bank { name: string; code: string }
interface Profile { name: string; email: string; phone: string; bank_name: string; bank_code: string; account_number: string; account_name: string }

const inp = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition bg-white";

// ─── Read-only row ─────────────────────────────────────────────────────────────
function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start justify-between py-3.5 border-b border-gray-50 last:border-0 gap-4">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-32 flex-shrink-0 mt-0.5">{label}</span>
      <span className="text-sm text-gray-800 font-medium flex-1">{value || <span className="text-gray-300 italic">Not set</span>}</span>
    </div>
  );
}

// ─── Section card ──────────────────────────────────────────────────────────────
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <p className="font-semibold text-gray-900">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-6 py-2">{children}</div>
    </div>
  );
}

// ─── Save / Cancel bar ────────────────────────────────────────────────────────
function ActionBar({ saving, saved, error, onSave, onCancel, label = "Save Changes" }: {
  saving: boolean; saved: boolean; error: string; onSave: () => void; onCancel: () => void; label?: string;
}) {
  return (
    <div className="pt-4 pb-2 flex items-center gap-3 flex-wrap">
      {error && <p className="text-red-500 text-xs w-full">{error}</p>}
      {saved && <p className="text-green-600 text-xs flex items-center gap-1 w-full"><CheckCircle size={12} /> Saved successfully</p>}
      <button onClick={onSave} disabled={saving}
        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
        {saving && <Loader2 size={13} className="animate-spin" />}
        {saving ? "Saving…" : label}
      </button>
      <button onClick={onCancel} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 px-3 py-2.5">
        <X size={13} /> Cancel
      </button>
    </div>
  );
}

export default function CreatorSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({ name: "", email: "", phone: "", bank_name: "", bank_code: "", account_number: "", account_name: "" });
  const [loaded, setLoaded] = useState(false);

  // Edit section toggles
  const [editProfile, setEditProfile] = useState(false);
  const [editBank, setEditBank]       = useState(false);
  const [editPw, setEditPw]           = useState(false);

  // Profile form
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved]   = useState(false);
  const [profileError, setProfileError]   = useState("");

  // Password form
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw]         = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [pwSaving, setPwSaving]   = useState(false);
  const [pwSaved, setPwSaved]     = useState(false);
  const [pwError, setPwError]     = useState("");

  // Bank form
  const [banks, setBanks]               = useState<Bank[]>([]);
  const [bankCode, setBankCode]         = useState("");
  const [bankName, setBankName]         = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName]   = useState("");
  const [resolving, setResolving]       = useState(false);
  const [resolveError, setResolveError] = useState("");
  const [bankSaving, setBankSaving]     = useState(false);
  const [bankSaved, setBankSaved]       = useState(false);
  const [bankError, setBankError]       = useState("");
  const resolveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/creator/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const p = { name: d.name ?? "", email: d.email ?? "", phone: d.phone ?? "", bank_name: d.bank_name ?? "", bank_code: d.bank_code ?? "", account_number: d.account_number ?? "", account_name: d.account_name ?? "" };
        setProfile(p);
        setName(p.name); setEmail(p.email); setPhone(p.phone);
        setBankCode(p.bank_code); setBankName(p.bank_name);
        setAccountNumber(p.account_number); setAccountName(p.account_name);
        setLoaded(true);
      }).catch(() => {});
    fetch("/api/creator/banks").then((r) => r.json()).then((d: Bank[]) => setBanks(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  // Auto-resolve account
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
    } else if (accountNumber.length !== 10) { setAccountName(""); }
    return () => { if (resolveTimer.current) clearTimeout(resolveTimer.current); };
  }, [accountNumber, bankCode]);

  const handleBankSelect = (code: string) => {
    setBankCode(code);
    setBankName(banks.find((b) => b.code === code)?.name ?? "");
    setAccountName("");
  };

  const openEditProfile = () => { setName(profile.name); setEmail(profile.email); setPhone(profile.phone); setProfileError(""); setProfileSaved(false); setEditProfile(true); };
  const openEditBank    = () => { setBankCode(profile.bank_code); setBankName(profile.bank_name); setAccountNumber(profile.account_number); setAccountName(profile.account_name); setBankError(""); setBankSaved(false); setEditBank(true); };

  const saveProfile = async () => {
    setProfileSaving(true); setProfileError(""); setProfileSaved(false);
    const res = await fetch("/api/creator/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ name, email, phone }) });
    const data = await res.json();
    if (!res.ok) { setProfileError(data.error ?? "Failed to save"); }
    else { setProfile((p) => ({ ...p, name, email, phone })); setProfileSaved(true); setEditProfile(false); router.refresh(); }
    setProfileSaving(false);
  };

  const savePassword = async () => {
    setPwError(""); setPwSaved(false);
    if (!currentPw || !newPw || !confirmPw) { setPwError("All fields are required"); return; }
    if (newPw !== confirmPw) { setPwError("Passwords don't match"); return; }
    if (newPw.length < 8) { setPwError("Password must be at least 8 characters"); return; }
    setPwSaving(true);
    const res = await fetch("/api/creator/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ current_password: currentPw, new_password: newPw }) });
    const data = await res.json();
    if (!res.ok) setPwError(data.error ?? "Failed");
    else { setPwSaved(true); setCurrentPw(""); setNewPw(""); setConfirmPw(""); setEditPw(false); }
    setPwSaving(false);
  };

  const saveBankDetails = async () => {
    if (!bankCode || !accountNumber || !accountName) { setBankError("Complete all bank details"); return; }
    setBankSaving(true); setBankError(""); setBankSaved(false);
    const res = await fetch("/api/creator/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ bank_name: bankName, bank_code: bankCode, account_number: accountNumber, account_name: accountName }) });
    const data = await res.json();
    if (!res.ok) setBankError(data.error ?? "Failed");
    else { setProfile((p) => ({ ...p, bank_name: bankName, bank_code: bankCode, account_number: accountNumber, account_name: accountName })); setBankSaved(true); setEditBank(false); }
    setBankSaving(false);
  };

  if (!loaded) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={22} className="animate-spin text-orange-500" />
    </div>
  );

  return (
    <div className="max-w-xl space-y-4">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-400 text-sm mt-0.5">Manage your account details</p>
      </div>

      {/* ── Profile ─────────────────────────────────────────────────── */}
      <Section title="Profile" subtitle="Your public and account details">
        {!editProfile ? (
          <>
            <Row label="Full Name"  value={profile.name} />
            <Row label="Email"      value={profile.email} />
            <Row label="Phone"      value={profile.phone} />
            <div className="py-4">
              <button onClick={openEditProfile}
                className="flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                <Pencil size={13} /> Edit profile
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="py-4 border-b border-gray-50">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Full Name</label>
              <input className={inp} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="py-4 border-b border-gray-50">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Email Address</label>
              <input className={inp} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
              <p className="text-xs text-amber-600 mt-1.5">Changing your email requires re-verification.</p>
            </div>
            <div className="py-4">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Phone Number</label>
              <input className={inp} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" />
            </div>
            <ActionBar saving={profileSaving} saved={profileSaved} error={profileError} onSave={saveProfile} onCancel={() => setEditProfile(false)} />
          </>
        )}
      </Section>

      {/* ── Bank Details ─────────────────────────────────────────────── */}
      <Section title="Bank Account" subtitle="Where your payouts are sent">
        {!editBank ? (
          <>
            <Row label="Bank"           value={profile.bank_name} />
            <Row label="Account Number" value={profile.account_number} />
            <Row label="Account Name"   value={profile.account_name} />
            <div className="py-4">
              <button onClick={openEditBank}
                className="flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                <Pencil size={13} /> {profile.bank_name ? "Edit bank details" : "Add bank details"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="py-4 border-b border-gray-50">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Bank</label>
              <select value={bankCode} onChange={(e) => handleBankSelect(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="">Select bank…</option>
                {banks.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
              </select>
            </div>
            <div className="py-4 border-b border-gray-50">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Account Number</label>
              <input className={inp} type="text" inputMode="numeric" value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))} placeholder="0123456789" maxLength={10} />
            </div>
            <div className="py-4">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Account Name</label>
              <div className="relative">
                <input className={`${inp} bg-gray-50 cursor-default`} readOnly value={accountName}
                  placeholder={resolving ? "Verifying…" : resolveError || "Auto-filled from account number"} />
                {resolving   && <Loader2    size={13} className="absolute right-3 top-3 text-orange-500 animate-spin" />}
                {!resolving && accountName  && <CheckCircle size={13} className="absolute right-3 top-3 text-green-500" />}
                {!resolving && resolveError && <AlertCircle size={13} className="absolute right-3 top-3 text-red-400" />}
              </div>
              {resolveError && <p className="text-red-400 text-xs mt-1">{resolveError}</p>}
              {accountName  && <p className="text-green-600 text-xs mt-1">✓ {accountName}</p>}
            </div>
            <ActionBar saving={bankSaving} saved={bankSaved} error={bankError} onSave={saveBankDetails} onCancel={() => setEditBank(false)} label="Save Bank Details" />
          </>
        )}
      </Section>

      {/* ── Password ─────────────────────────────────────────────────── */}
      <Section title="Password" subtitle="Keep your account secure">
        {!editPw ? (
          <div className="py-4">
            <Row label="Password" value="••••••••••" />
            <button onClick={() => { setCurrentPw(""); setNewPw(""); setConfirmPw(""); setPwError(""); setPwSaved(false); setEditPw(true); }}
              className="flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors mt-3">
              <Pencil size={13} /> Change password
            </button>
          </div>
        ) : (
          <>
            <div className="py-4 border-b border-gray-50">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Current Password</label>
              <div className="relative">
                <input className={`${inp} pr-10`} type={showPw ? "text" : "password"} value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="py-4 border-b border-gray-50">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">New Password</label>
              <input className={inp} type={showPw ? "text" : "password"} value={newPw}
                onChange={(e) => setNewPw(e.target.value)} placeholder="Min 8 characters" />
            </div>
            <div className="py-4">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Confirm New Password</label>
              <input className={inp} type={showPw ? "text" : "password"} value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)} placeholder="Repeat new password" />
            </div>
            <ActionBar saving={pwSaving} saved={pwSaved} error={pwError} onSave={savePassword} onCancel={() => setEditPw(false)} label="Update Password" />
          </>
        )}
      </Section>
    </div>
  );
}
