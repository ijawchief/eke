"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X, Check, Loader2, ShieldBan, ShieldAlert, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

type AffStatus = "active" | "restricted" | "banned";

interface Payout {
  id: string;
  affiliate_id: string;
  amount_kobo: number;
  status: string;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  note: string | null;
  created_at: string;
}

interface Affiliate {
  id: string;
  name: string;
  email: string;
  username: string;
  balance_kobo: number;
  total_earned_kobo: number;
  status: AffStatus;
  status_note: string | null;
  created_at: string;
  payouts: Payout[];
  pending_kobo: number;
  paid_kobo: number;
}

interface EditForm { name: string; email: string; username: string; password: string; }
const emptyEdit: EditForm = { name: "", email: "", username: "", password: "" };

const STATUS_CONFIG: Record<AffStatus, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  active:     { label: "Active",      bg: "bg-green-100",  text: "text-green-700",  icon: <ShieldCheck size={11} /> },
  restricted: { label: "Restricted",  bg: "bg-yellow-100", text: "text-yellow-700", icon: <ShieldAlert size={11} /> },
  banned:     { label: "Banned",      bg: "bg-red-100",    text: "text-red-700",    icon: <ShieldBan size={11} /> },
};

function StatusBadge({ status }: { status: AffStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.active;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

export function AffiliatesClient({ affiliates }: { affiliates: Affiliate[] }) {
  const router = useRouter();
  const [updating, setUpdating]           = useState<string | null>(null);
  const [expanded, setExpanded]           = useState<string | null>(null);
  const [editId, setEditId]               = useState<string | null>(null);
  const [editForm, setEditForm]           = useState<EditForm>(emptyEdit);
  const [editError, setEditError]         = useState("");
  const [editSaving, setEditSaving]       = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [statusModal, setStatusModal]     = useState<{ id: string; current: AffStatus; name: string } | null>(null);
  const [statusTarget, setStatusTarget]   = useState<AffStatus>("active");
  const [statusNote, setStatusNote]       = useState("");
  const [statusSaving, setStatusSaving]   = useState(false);

  const allPayouts = affiliates.flatMap((a) => a.payouts.map((p) => ({ ...p, affiliateName: a.name, affiliateEmail: a.email })));
  const pendingPayouts = allPayouts.filter((p) => p.status === "pending");

  const openEdit = (a: Affiliate) => {
    setEditForm({ name: a.name, email: a.email, username: a.username, password: "" });
    setEditError("");
    setEditId(a.id);
  };

  const openStatusModal = (a: Affiliate) => {
    setStatusTarget(a.status);
    setStatusNote(a.status_note ?? "");
    setStatusModal({ id: a.id, current: a.status, name: a.name });
  };

  const saveEdit = async () => {
    if (!editForm.name || !editForm.email || !editForm.username) { setEditError("Name, email and username are required"); return; }
    setEditSaving(true); setEditError("");
    const res = await fetch("/api/admin/affiliates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ type: "affiliate", id: editId, ...editForm }),
    });
    const d = await res.json();
    setEditSaving(false);
    if (!res.ok) { setEditError(d.error ?? "Failed to save"); return; }
    setEditId(null);
    router.refresh();
  };

  const saveStatus = async () => {
    if (!statusModal) return;
    setStatusSaving(true);
    await fetch("/api/admin/affiliates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ type: "status", id: statusModal.id, status: statusTarget, status_note: statusNote }),
    });
    setStatusSaving(false);
    setStatusModal(null);
    router.refresh();
  };

  const deleteAffiliate = async (id: string) => {
    setUpdating(id);
    await fetch(`/api/admin/affiliates?id=${id}`, { method: "DELETE", credentials: "include" });
    setUpdating(null);
    setDeleteConfirm(null);
    router.refresh();
  };

  const updatePayout = async (id: string, status: string, note?: string) => {
    setUpdating(id);
    await fetch("/api/admin/affiliates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, status, note }),
    });
    setUpdating(null);
    router.refresh();
  };

  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition";

  const counts = {
    active:     affiliates.filter(a => a.status === "active").length,
    restricted: affiliates.filter(a => a.status === "restricted").length,
    banned:     affiliates.filter(a => a.status === "banned").length,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Affiliates</h1>
        <p className="text-gray-400 text-sm mt-1">Manage affiliate accounts, statuses, and payouts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Total Affiliates</p>
          <p className="text-2xl font-extrabold text-gray-900">{affiliates.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Active</p>
          <p className="text-2xl font-extrabold text-green-600">{counts.active}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Restricted</p>
          <p className="text-2xl font-extrabold text-yellow-600">{counts.restricted}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Banned</p>
          <p className="text-2xl font-extrabold text-red-600">{counts.banned}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Pending Payouts</p>
          <p className="text-2xl font-extrabold text-orange-600">{pendingPayouts.length}</p>
        </div>
      </div>

      {/* Pending payouts */}
      {pendingPayouts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Pending Payout Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3 text-left">Affiliate</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Bank</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingPayouts.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{p.affiliateName}</p>
                      <p className="text-xs text-gray-400">{p.affiliateEmail}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{formatNaira(p.amount_kobo)}</td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700">{p.account_name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{p.bank_name ?? "—"} · {p.account_number ?? "—"}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{new Date(p.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => updatePayout(p.id, "paid")} disabled={updating === p.id}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg">
                          {updating === p.id ? "…" : "Mark Paid"}
                        </button>
                        <button onClick={() => updatePayout(p.id, "rejected", "Rejected by admin")} disabled={updating === p.id}
                          className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg">
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All affiliates */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">All Affiliates ({affiliates.length})</h2>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-gray-50">
          {affiliates.length === 0 && <p className="text-center py-12 text-gray-400 text-sm">No affiliates yet</p>}
          {affiliates.map((a) => (
            <div key={a.id} className={`px-4 py-4 ${a.status === "banned" ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-semibold text-gray-800 text-sm">{a.name}</p>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="text-xs text-gray-400 truncate">{a.email}</p>
                  <p className="text-xs text-gray-400">@{a.username}</p>
                  {a.status_note && <p className="text-xs text-gray-400 mt-0.5 italic">{a.status_note}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openStatusModal(a)} title="Manage status" className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50">
                    <ShieldAlert size={15} />
                  </button>
                  <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                    <Pencil size={15} />
                  </button>
                  {deleteConfirm === a.id ? (
                    <>
                      <button onClick={() => deleteAffiliate(a.id)} disabled={!!updating} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Check size={15} /></button>
                      <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X size={15} /></button>
                    </>
                  ) : (
                    <button onClick={() => setDeleteConfirm(a.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
                  )}
                </div>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="text-gray-500">Earned: <strong className="text-emerald-600">{formatNaira(a.total_earned_kobo)}</strong></span>
                <span className="text-gray-500">Balance: <strong className="text-gray-800">{formatNaira(a.balance_kobo)}</strong></span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Username</th>
                <th className="px-6 py-3 text-left">Total Earned</th>
                <th className="px-6 py-3 text-left">Balance</th>
                <th className="px-6 py-3 text-left">Joined</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {affiliates.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400">No affiliates yet</td></tr>
              )}
              {affiliates.map((a, index) => (
                <div key={index}>
                  <tr key={a.id} className={`hover:bg-gray-50 transition-colors ${a.status === "banned" ? "opacity-60" : ""}`}>
                    <td className="px-6 py-4 cursor-pointer" onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                      <p className="font-medium text-gray-800 flex items-center gap-1.5">
                        {a.name}
                        {expanded === a.id ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
                      </p>
                      <p className="text-xs text-gray-400">{a.email}</p>
                      {a.status_note && <p className="text-xs text-gray-400 italic mt-0.5 max-w-[200px] truncate">{a.status_note}</p>}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={a.status} /></td>
                    <td className="px-6 py-4 text-gray-600">@{a.username}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">{formatNaira(a.total_earned_kobo)}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{formatNaira(a.balance_kobo)}</td>
                    <td className="px-6 py-4 text-gray-400">{new Date(a.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openStatusModal(a)} title="Ban / restrict / unban" className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors">
                          <ShieldAlert size={14} />
                        </button>
                        <button onClick={() => openEdit(a)} title="Edit" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                          <Pencil size={14} />
                        </button>
                        {deleteConfirm === a.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => deleteAffiliate(a.id)} disabled={!!updating} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Check size={14} /></button>
                            <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X size={14} /></button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(a.id)} title="Delete" className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expanded === a.id && a.payouts.length > 0 && (
                    <tr key={`${a.id}-payouts`}>
                      <td colSpan={7} className="px-6 pb-4">
                        <div className="bg-gray-50 rounded-xl overflow-hidden">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-gray-400 uppercase tracking-wide">
                                <th className="px-4 py-2 text-left">Amount</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-left">Bank</th>
                                <th className="px-4 py-2 text-left">Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {a.payouts.map((p) => (
                                <tr key={p.id}>
                                  <td className="px-4 py-2 font-semibold">{formatNaira(p.amount_kobo)}</td>
                                  <td className="px-4 py-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                      p.status === "paid" ? "bg-green-100 text-green-700" :
                                      p.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                      "bg-red-100 text-red-600"
                                    }`}>{p.status}</span>
                                  </td>
                                  <td className="px-4 py-2 text-gray-500">{p.bank_name ?? "—"} · {p.account_number ?? "—"}</td>
                                  <td className="px-4 py-2 text-gray-400">{new Date(p.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </div>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status / ban modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Manage — {statusModal.name}</h2>
              <button onClick={() => setStatusModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} className="text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Account Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["active", "restricted", "banned"] as AffStatus[]).map((s) => {
                    const cfg = STATUS_CONFIG[s];
                    return (
                      <button key={s} onClick={() => setStatusTarget(s)}
                        className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                          statusTarget === s ? `border-current ${cfg.bg} ${cfg.text}` : "border-gray-100 text-gray-400 hover:border-gray-200"
                        }`}>
                        <span className="text-base">{s === "active" ? "✅" : s === "restricted" ? "⚠️" : "🚫"}</span>
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Reason / Note <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Violating terms of service, fraud suspected…"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">This note is shown to the affiliate when they try to log in.</p>
              </div>
              <button onClick={saveStatus} disabled={statusSaving}
                className={`w-full font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 text-white disabled:opacity-50 ${
                  statusTarget === "banned"     ? "bg-red-600 hover:bg-red-700" :
                  statusTarget === "restricted" ? "bg-yellow-500 hover:bg-yellow-600" :
                                                  "bg-green-600 hover:bg-green-700"
                }`}>
                {statusSaving && <Loader2 size={15} className="animate-spin" />}
                {statusSaving ? "Saving…" : `Set to ${STATUS_CONFIG[statusTarget].label}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Edit Affiliate</h2>
              <button onClick={() => setEditId(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} className="text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: "name",     label: "Full Name",                              type: "text",     placeholder: "Jane Doe" },
                { key: "email",    label: "Email",                                  type: "email",    placeholder: "jane@example.com" },
                { key: "username", label: "Username",                               type: "text",     placeholder: "janedoe" },
                { key: "password", label: "New Password (leave blank to keep)",     type: "password", placeholder: "••••••••" },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                  <input type={type} value={editForm[key as keyof EditForm]}
                    onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder} className={inp} />
                </div>
              ))}
              {editError && <p className="text-red-500 text-sm">{editError}</p>}
              <button onClick={saveEdit} disabled={editSaving}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                {editSaving && <Loader2 size={15} className="animate-spin" />}
                {editSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
