"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";

interface Creator {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  onboarding_done: boolean | null;
  email_verified: boolean | null;
  created_at: string;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  is_admin: boolean | null;
}

interface FormState {
  name: string;
  email: string;
  username: string;
  password: string;
  is_admin: boolean;
}

const emptyForm: FormState = { name: "", email: "", username: "", password: "", is_admin: false };

export function UsersClient({ creators }: { creators: Creator[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setError(""); setShowForm(true); };
  const openEdit = (c: Creator) => {
    setEditId(c.id);
    setForm({ name: c.name ?? "", email: c.email ?? "", username: c.username ?? "", password: "", is_admin: !!c.is_admin });
    setError("");
    setShowForm(true);
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
      body: JSON.stringify({ id: editId, ...form, is_admin: form.is_admin }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed"); setLoading(false); return; }
    setLoading(false);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-400 text-sm mt-1">Manage admin and creator accounts</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Admin account card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center text-white text-sm font-bold">A</div>
          <div>
            <p className="font-semibold text-gray-800">Admin</p>
            <p className="text-xs text-gray-400">Oporo System Ltd · env-managed</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-700">Admin</span>
      </div>

      {/* Creators table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Creator Accounts ({creators.length})</h2>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3">Creator</th>
              <th className="px-6 py-3">Username</th>
              <th className="px-6 py-3">Bank</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Joined</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {creators.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">No creators yet</td></tr>
            )}
            {creators.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3.5">
                  <p className="font-semibold text-gray-800">{c.name ?? "—"}</p>
                  <p className="text-xs text-gray-400">{c.email ?? "—"}</p>
                </td>
                <td className="px-6 py-3.5 text-gray-600">{c.username ?? "—"}</td>
                <td className="px-6 py-3.5 text-xs text-gray-500">
                  {c.bank_name ? (
                    <><p>{c.bank_name}</p><p className="text-gray-400">{c.account_number}</p></>
                  ) : "—"}
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex flex-col gap-1">
                    {c.is_admin ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold w-fit bg-pink-100 text-pink-700">Admin</span>
                    ) : (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold w-fit ${
                        c.onboarding_done ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {c.onboarding_done ? "Onboarded" : "Pending setup"}
                      </span>
                    )}
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold w-fit ${
                      c.email_verified ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {c.email_verified ? "Email verified" : "Unverified"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-3.5 text-xs text-gray-400">
                  {new Date(c.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(c)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    {deleteConfirm === c.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(c.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editId ? "Edit Creator" : "Add Creator"}</h2>
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Role toggle */}
              <div className="flex rounded-xl overflow-hidden border border-gray-200">
                {(["Creator", "Admin"] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, is_admin: role === "Admin" }))}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                      (role === "Admin") === form.is_admin
                        ? "bg-pink-500 text-white"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              {[
                { key: "name", label: "Full Name", type: "text", placeholder: "Jane Doe" },
                { key: "email", label: "Email", type: "email", placeholder: "jane@example.com" },
                { key: "username", label: "Username", type: "text", placeholder: "janedoe" },
                { key: "password", label: editId ? "New Password (leave blank to keep)" : "Password", type: "password", placeholder: "••••••••" },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof Omit<FormState, "is_admin">] as string}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>
              ))}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? "Saving…" : editId ? "Save Changes" : `Create ${form.is_admin ? "Admin" : "Creator"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
