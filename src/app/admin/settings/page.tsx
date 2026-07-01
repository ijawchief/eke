"use client";

import { useState } from "react";
import { User, Lock, Bell, Globe, Shield, CheckCircle } from "lucide-react";

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
        <Icon size={16} className="text-pink-500" />
        <h2 className="font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start py-4 border-b border-gray-50 last:border-0">
      <label className="text-sm font-medium text-gray-600 pt-2.5">{label}</label>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
    />
  );
}

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [storeName, setStoreName] = useState("Oporo System Ltd");
  const [storeUrl, setStoreUrl] = useState("https://eke.store");
  const [supportEmail, setSupportEmail] = useState("support@eke.store");
  const [notifyNewSale, setNotifyNewSale] = useState(true);
  const [notifyWithdrawal, setNotifyWithdrawal] = useState(true);
  const [notifyNewCreator, setNotifyNewCreator] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePasswordChange = async () => {
    setPwError("");
    if (!currentPw || !newPw || !confirmPw) { setPwError("All fields required"); return; }
    if (newPw !== confirmPw) { setPwError("Passwords don't match"); return; }
    if (newPw.length < 8) { setPwError("Password must be at least 8 characters"); return; }
    // In a real app this would call an API
    setPwSaved(true);
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setTimeout(() => setPwSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your store and account preferences</p>
      </div>

      {/* Profile */}
      <Section title="Profile" icon={User}>
        <Field label="Admin Name">
          <Input defaultValue="Admin" placeholder="Your name" />
        </Field>
        <Field label="Business Name">
          <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Oporo System Ltd" />
        </Field>
        <Field label="Support Email">
          <Input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} placeholder="support@yourstore.com" />
        </Field>
        <div className="pt-4">
          <button onClick={handleSave} className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            {saved ? <><CheckCircle size={15} /> Saved!</> : "Save Changes"}
          </button>
        </div>
      </Section>

      {/* Store */}
      <Section title="Store" icon={Globe}>
        <Field label="Store URL">
          <Input value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} placeholder="https://yourstore.com" />
        </Field>
        <Field label="Default Currency">
          <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-300">
            <option value="USD">USD — US Dollar</option>
            <option value="NGN">NGN — Nigerian Naira</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">Change display currency from the top bar on any admin page.</p>
        </Field>
        <Field label="Paystack Mode">
          <div className="flex items-center gap-3 mt-1">
            <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Live Mode Active</span>
            <span className="text-xs text-gray-400">Switch in .env.local → PAYSTACK_SECRET_KEY</span>
          </div>
        </Field>
        <div className="pt-4">
          <button onClick={handleSave} className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            {saved ? <><CheckCircle size={15} /> Saved!</> : "Save Changes"}
          </button>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        {[
          { label: "New sale", sub: "Get notified every time a payment completes", value: notifyNewSale, set: setNotifyNewSale },
          { label: "Withdrawal request", sub: "Alert when a creator submits a withdrawal", value: notifyWithdrawal, set: setNotifyWithdrawal },
          { label: "New creator signup", sub: "Alert when a new creator completes onboarding", value: notifyNewCreator, set: setNotifyNewCreator },
        ].map(({ label, sub, value, set }) => (
          <div key={label} className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
            <button
              onClick={() => set(!value)}
              className={`relative w-10 h-6 rounded-full transition-colors ${value ? "bg-pink-500" : "bg-gray-200"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : "translate-x-1"}`} />
            </button>
          </div>
        ))}
      </Section>

      {/* Security */}
      <Section title="Security" icon={Lock}>
        <Field label="Current Password">
          <Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" />
        </Field>
        <Field label="New Password">
          <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="••••••••" />
        </Field>
        <Field label="Confirm Password">
          <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="••••••••" />
        </Field>
        {pwError && <p className="text-red-500 text-sm mt-1">{pwError}</p>}
        {pwSaved && <p className="text-green-600 text-sm mt-1 flex items-center gap-1"><CheckCircle size={14} /> Password updated</p>}
        <div className="pt-4">
          <button onClick={handlePasswordChange} className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            Update Password
          </button>
        </div>
      </Section>

      {/* Danger zone */}
      <Section title="Danger Zone" icon={Shield}>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-800">Clear all sessions</p>
            <p className="text-xs text-gray-400 mt-0.5">Force all admin logins to re-authenticate</p>
          </div>
          <button className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
            Clear Sessions
          </button>
        </div>
      </Section>
    </div>
  );
}
