"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Check, Loader2, ShieldCheck } from "lucide-react";

interface Member {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  created_at: string;
  is_admin: boolean | null;
}

interface FormState { name: string; email: string; username: string; password: string; }
const emptyForm: FormState = { name: "", email: "", username: "", password: "" };

export function TeamClient({ members }: { members: Member[] }) {
  const router = useRouter();
  const [showForm, setShowForm]           = useState(false);
  const [editId, setEditId]               = useState<string | null>(null);
  const [form, setForm]                   = useState<FormState>(emptyForm);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setError(""); setShowForm(true); };
  const openEdit = (m: Member) => {
    setEditId(m.id);
    setForm({ name: m.name ?? "", email: m.email ?? "", username: m.username ?? "", password: "" });
    setError(""); setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditId(null); };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.username) { setError("Name, email and username are required"); return; }
    if (!editId && !form.password) { setError("Password is required"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/admin/users", {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: editId, ...form, is_admin: true }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Failed"); return; }
    closeForm();
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    await fetch(`/api/admin/users?id=${id}`, { method: "DELETE", credentials: "include" });
    setLoading(false);
    setDeleteConfirm(null);
    router.refresh();
  };

  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-400 text-sm mt-1">Manage Veelage team accounts</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={15} /> Add Member
        </button>
      </div>

      {/* Env-managed master admin */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">A</div>
          <div>
            <p className="font-semibold text-gray-800">Master Admin</p>
            <p className="text-xs text-gray-400">Managed via environment variables — credentials set in Vercel</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 flex items-center gap-1">
          <ShieldCheck size={11} /> Super Admin
        </span>
      </div>

      {/* DB admin accounts */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Admin Accounts ({members.length})</h2>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-gray-50">
          {members.length === 0 && <p className="text-center py-12 text-gray-400 text-sm">No team members yet. Add your first admin account.</p>}
          {members.map((m) => (
            <div key={m.id} className="px-4 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{m.name ?? "—"}</p>
                <p className="text-xs text-gray-400 truncate">{m.email ?? "—"}</p>
                <p className="text-xs text-gray-400">@{m.username ?? "—"}</p>
                <p className="text-xs text-gray-400 mt-0.5">Joined {new Date(m.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"><Pencil size={15} /></button>
                {deleteConfirm === m.id ? (
                  <>
                    <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Check size={15} /></button>
                    <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X size={15} /></button>
                  </>
                ) : (
                  <button onClick={() => setDeleteConfirm(m.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Username</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-left">Added</th>
                <th className="px-6 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">No team members yet</td></tr>
              )}
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3.5">
                    <p className="font-semibold text-gray-800">{m.name ?? "—"}</p>
                    <p className="text-xs text-gray-400">{m.email ?? "—"}</p>
                  </td>
                  <td className="px-6 py-3.5 text-gray-600">@{m.username ?? "—"}</td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                      <ShieldCheck size={11} /> Admin
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-xs text-gray-400">
                    {new Date(m.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"><Pencil size={14} /></button>
                      {deleteConfirm === m.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Check size={14} /></button>
                          <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X size={14} /></button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(m.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editId ? "Edit Team Member" : "Add Admin Account"}</h2>
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} className="text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 bg-orange-50 rounded-xl px-3 py-2.5 text-xs text-orange-700">
                <ShieldCheck size={14} /> This account will have full admin access to the dashboard
              </div>
              {[
                { key: "name",     label: "Full Name",                           type: "text",     placeholder: "Jane Doe" },
                { key: "email",    label: "Email",                               type: "email",    placeholder: "jane@veelage.co" },
                { key: "username", label: "Username",                            type: "text",     placeholder: "janedoe" },
                { key: "password", label: editId ? "New Password (leave blank to keep)" : "Password", type: "password", placeholder: "••••••••" },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                  <input type={type} value={form[key as keyof FormState]}
                    onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder} className={inp} />
                </div>
              ))}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button onClick={handleSubmit} disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? "Saving…" : editId ? "Save Changes" : "Create Admin Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
