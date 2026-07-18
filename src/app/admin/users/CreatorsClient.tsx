"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X, Check, Loader2, ShieldCheck, ShieldOff } from "lucide-react";

function fmt(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

interface Creator {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  onboarding_done: boolean | null;
  email_verified: boolean | null;
  created_at: string;
  published: number;
  revenue: number;
  units: number;
}

interface EditForm { name: string; email: string; username: string; password: string; }

export function CreatorsClient({ creators }: { creators: Creator[] }) {
  const router = useRouter();
  const [editId, setEditId]               = useState<string | null>(null);
  const [form, setForm]                   = useState<EditForm>({ name: "", email: "", username: "", password: "" });
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openEdit = (c: Creator) => {
    setEditId(c.id);
    setForm({ name: c.name ?? "", email: c.email ?? "", username: c.username ?? "", password: "" });
    setError("");
  };
  const closeEdit = () => { setEditId(null); };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.username) { setError("Name, email and username are required"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: editId, ...form }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Failed"); return; }
    closeEdit();
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    await fetch(`/api/admin/users?id=${id}`, { method: "DELETE", credentials: "include" });
    setLoading(false);
    setDeleteConfirm(null);
    router.refresh();
  };

  const toggleActivate = async (id: string, current: boolean) => {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, email_verified: !current }),
    });
    router.refresh();
  };

  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Creators</h1>
        <p className="text-gray-400 text-sm mt-1">Manage creator accounts, products, and activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Total Creators</p>
          <p className="text-2xl font-extrabold text-gray-900">{creators.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Active</p>
          <p className="text-2xl font-extrabold text-green-600">{creators.filter(c => c.email_verified).length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Published Products</p>
          <p className="text-2xl font-extrabold text-orange-600">{creators.reduce((s, c) => s + c.published, 0)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Total Revenue</p>
          <p className="text-2xl font-extrabold text-emerald-600">{fmt(creators.reduce((s, c) => s + c.revenue, 0))}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">All Creators ({creators.length})</h2>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-gray-50">
          {creators.length === 0 && <p className="text-center py-12 text-gray-400 text-sm">No creators yet</p>}
          {creators.map((c) => (
            <div key={c.id} className="px-4 py-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{c.name ?? "—"}</p>
                  <p className="text-xs text-gray-400 truncate">{c.email ?? "—"}</p>
                  <p className="text-xs text-gray-400">@{c.username ?? "—"}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleActivate(c.id, !!c.email_verified)} title={c.email_verified ? "Deactivate" : "Activate"}
                    className={`p-1.5 rounded-lg transition-colors ${c.email_verified ? "text-green-500 hover:bg-green-50" : "text-gray-300 hover:text-green-500 hover:bg-green-50"}`}>
                    {c.email_verified ? <ShieldCheck size={15} /> : <ShieldOff size={15} />}
                  </button>
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"><Pencil size={15} /></button>
                  {deleteConfirm === c.id ? (
                    <>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Check size={15} /></button>
                      <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X size={15} /></button>
                    </>
                  ) : (
                    <button onClick={() => setDeleteConfirm(c.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-gray-500">Products: <strong className="text-gray-800">{c.published}</strong></span>
                <span className="text-gray-500">Sales: <strong className="text-emerald-600">{fmt(c.revenue)}</strong></span>
                <span className="text-gray-500">Units: <strong className="text-gray-800">{c.units}</strong></span>
              </div>
              <div className="flex gap-1.5 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.email_verified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {c.email_verified ? "Active" : "Inactive"}
                </span>
                {!c.onboarding_done && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Setup pending</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm min-w-[780px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">Creator</th>
                <th className="px-6 py-3 text-left">Products</th>
                <th className="px-6 py-3 text-left">Sales Rev</th>
                <th className="px-6 py-3 text-left">Units Sold</th>
                <th className="px-6 py-3 text-left">Joined</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {creators.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No creators yet</td></tr>
              )}
              {creators.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3.5">
                    <p className="font-semibold text-gray-800">{c.name ?? "—"}</p>
                    <p className="text-xs text-gray-400">{c.email ?? "—"}</p>
                    <p className="text-xs text-gray-400">@{c.username ?? "—"}</p>
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-gray-800">{c.published}</td>
                  <td className="px-6 py-3.5 font-bold text-emerald-600">{fmt(c.revenue)}</td>
                  <td className="px-6 py-3.5 text-gray-700">{c.units}</td>
                  <td className="px-6 py-3.5 text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold w-fit ${c.email_verified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {c.email_verified ? "Active" : "Inactive"}
                      </span>
                      {!c.onboarding_done && (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold w-fit bg-yellow-100 text-yellow-700">Setup pending</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => toggleActivate(c.id, !!c.email_verified)} title={c.email_verified ? "Deactivate" : "Activate"}
                        className={`p-1.5 rounded-lg transition-colors ${c.email_verified ? "text-green-500 hover:bg-green-50" : "text-gray-300 hover:text-green-500 hover:bg-green-50"}`}>
                        {c.email_verified ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                      </button>
                      <button onClick={() => openEdit(c)} title="Edit" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <Pencil size={14} />
                      </button>
                      {deleteConfirm === c.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Check size={14} /></button>
                          <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X size={14} /></button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(c.id)} title="Delete" className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      {editId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Edit Creator</h2>
              <button onClick={closeEdit} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} className="text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: "name",     label: "Full Name",                           type: "text",     placeholder: "Jane Doe" },
                { key: "email",    label: "Email",                               type: "email",    placeholder: "jane@example.com" },
                { key: "username", label: "Username",                            type: "text",     placeholder: "janedoe" },
                { key: "password", label: "New Password (leave blank to keep)",  type: "password", placeholder: "••••••••" },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                  <input type={type} value={form[key as keyof EditForm]}
                    onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder} className={inp} />
                </div>
              ))}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button onClick={handleSave} disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
