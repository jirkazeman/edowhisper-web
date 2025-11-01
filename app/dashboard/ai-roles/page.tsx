"use client";

import { useState, useEffect } from "react";
import { Brain, Plus, Edit2, Trash2, Save, X, RefreshCw } from "lucide-react";
import { aiRolesAPI } from "@/lib/api";
import { subscribeToAIRoles, unsubscribe } from "@/lib/realtime";
import { useAuth } from "@/lib/auth-context";
import type { AIRole as SupabaseAIRole } from "@/lib/types";

interface AIRoleDisplay {
  id: string;
  name: string;
  systemPrompt: string;
  createdAt: string;
}

export default function AIRolesPage() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AIRoleDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ name: string; systemPrompt: string }>({
    name: "",
    systemPrompt: "",
  });

  // Load AI roles from Supabase
  const loadRoles = async () => {
    try {
      setSyncing(true);
      const data = await aiRolesAPI.getAll();

      // Transform Supabase roles to display format
      const transformed: AIRoleDisplay[] = data.map((role: SupabaseAIRole) => ({
        id: role.id,
        name: role.name,
        systemPrompt: role.system_prompt,
        createdAt: new Date(role.created_at).toLocaleDateString("cs-CZ"),
      }));

      setRoles(transformed);
    } catch (error) {
      console.error("Failed to load AI roles:", error);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadRoles();

    // Subscribe to real-time changes
    const channel = subscribeToAIRoles(() => {
      loadRoles();
    });

    return () => {
      unsubscribe(channel);
    };
  }, []);

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({ name: "", systemPrompt: "" });
  };

  const handleEdit = (role: AIRoleDisplay) => {
    setEditingId(role.id);
    setFormData({ name: role.name, systemPrompt: role.systemPrompt });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.systemPrompt.trim()) return;
    if (!user) return;

    try {
      if (isCreating) {
        // Create new role with real user ID
        await aiRolesAPI.create(formData.name, formData.systemPrompt, user.id);
        setIsCreating(false);
      } else if (editingId) {
        // Update existing role
        await aiRolesAPI.update(editingId, formData.name, formData.systemPrompt);
        setEditingId(null);
      }

      setFormData({ name: "", systemPrompt: "" });
      await loadRoles();
    } catch (error) {
      console.error("Failed to save AI role:", error);
      alert("Nepodařilo se uložit AI roli. Zkuste to prosím znovu.");
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ name: "", systemPrompt: "" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Opravdu chcete smazat tuto AI roli?")) return;

    try {
      await aiRolesAPI.delete(id);
      setRoles(roles.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Failed to delete AI role:", error);
      alert("Nepodařilo se smazat AI roli. Zkuste to prosím znovu.");
    }
  };

  const isFormValid = formData.name?.trim() && formData.systemPrompt?.trim();

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="animate-spin mx-auto mb-4 text-purple-600" size={32} />
            <p className="text-gray-500">Načítání AI rolí...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">AI Role</h1>
              {syncing && (
                <RefreshCw className="animate-spin text-purple-600" size={20} />
              )}
            </div>
            <p className="text-gray-500">
              Spravujte AI asistenty a jejich systémové prompty
            </p>
          </div>
          {!isCreating && !editingId && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
            >
              <Plus size={18} />
              Nová role
            </button>
          )}
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingId) && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {isCreating ? "Nová AI role" : "Upravit AI roli"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Název role
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="např. Parodontolog, Stomatolog..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Systémový prompt
                </label>
                <textarea
                  value={formData.systemPrompt}
                  onChange={(e) =>
                    setFormData({ ...formData, systemPrompt: e.target.value })
                  }
                  placeholder="Popište roli a chování AI asistenta..."
                  rows={6}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={!isFormValid}
                  className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  Uložit
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
                >
                  <X size={18} />
                  Zrušit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-purple-300 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-50 rounded-lg">
                    <Brain className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {role.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Vytvořeno {role.createdAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(role)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                    title="Upravit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(role.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                    title="Smazat"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-mono leading-relaxed whitespace-pre-wrap">
                  {role.systemPrompt}
                </p>
              </div>
            </div>
          ))}
        </div>

        {roles.length === 0 && !isCreating && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Brain className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 mb-4">Zatím nemáte žádné AI role</p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
            >
              <Plus size={18} />
              Vytvořit první roli
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
