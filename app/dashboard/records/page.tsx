"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Edit2, Save, X, Trash2, Plus, RefreshCw } from "lucide-react";
import { recordsAPI } from "@/lib/api";
import { subscribeToRecords, unsubscribe } from "@/lib/realtime";
import type { ParoRecord, RecordFormData } from "@/lib/types";

interface RecordRow {
  id: string;
  lastName: string;
  personalIdNumber: string;
  isSmoker: "yes" | "no" | null;
  createdAt: string;
}

export default function RecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<RecordRow>>({});
  const [syncing, setSyncing] = useState(false);

  // Load records from Supabase
  const loadRecords = async () => {
    try {
      setSyncing(true);
      const data = await recordsAPI.getAll();

      // Transform Supabase records to table format
      const transformed: RecordRow[] = data.map((record: ParoRecord) => ({
        id: record.id,
        lastName: record.form_data?.lastName || "",
        personalIdNumber: record.form_data?.personalIdNumber || "",
        isSmoker: record.form_data?.isSmoker || null,
        createdAt: new Date(record.created_at).toLocaleDateString("cs-CZ"),
      }));

      setRecords(transformed);
    } catch (error) {
      console.error("Failed to load records:", error);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadRecords();

    // Subscribe to real-time changes
    const channel = subscribeToRecords(() => {
      loadRecords();
    });

    return () => {
      unsubscribe(channel);
    };
  }, []);

  const filteredRecords = records.filter(
    (record) =>
      record.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.personalIdNumber.includes(searchQuery)
  );

  const handleEdit = (record: RecordRow) => {
    setEditingId(record.id);
    setEditValues(record);
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      // Update in Supabase
      const updatedFormData: Partial<RecordFormData> = {
        lastName: editValues.lastName,
        personalIdNumber: editValues.personalIdNumber,
        isSmoker: editValues.isSmoker,
      };

      await recordsAPI.update(editingId, updatedFormData);

      // Update local state
      setRecords(
        records.map((r) =>
          r.id === editingId ? { ...r, ...editValues } : r
        )
      );

      setEditingId(null);
      setEditValues({});
    } catch (error) {
      console.error("Failed to save record:", error);
      alert("Nepodařilo se uložit změny. Zkuste to prosím znovu.");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Opravdu chcete smazat tento záznam?")) return;

    try {
      await recordsAPI.delete(id);
      setRecords(records.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Failed to delete record:", error);
      alert("Nepodařilo se smazat záznam. Zkuste to prosím znovu.");
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
            <p className="text-gray-500">Načítání záznamů...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Záznamy pacientů</h1>
              {syncing && (
                <RefreshCw className="animate-spin text-blue-600" size={20} />
              )}
            </div>
            <p className="text-gray-500">
              Spravujte a upravujte záznamy pacientů
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition">
            <Plus size={18} />
            Nový záznam
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hledat podle jména nebo rodného čísla..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Příjmení
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rodné číslo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kuřák
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vytvořeno
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.map((record) => {
                  const isEditing = editingId === record.id;
                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50 transition cursor-pointer"
                      onClick={(e) => {
                        // Don't navigate if clicking on action buttons or editing
                        if (isEditing || (e.target as HTMLElement).closest('button')) {
                          return;
                        }
                        router.push(`/dashboard/records/${record.id}`);
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValues.lastName || ""}
                            onChange={(e) =>
                              setEditValues({ ...editValues, lastName: e.target.value })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-900">
                            {record.lastName}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValues.personalIdNumber || ""}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                personalIdNumber: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        ) : (
                          <span className="text-sm text-gray-500">
                            {record.personalIdNumber}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <select
                            value={editValues.isSmoker || ""}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                isSmoker: e.target.value as "yes" | "no" | null,
                              })
                            }
                            className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          >
                            <option value="">Neznámo</option>
                            <option value="yes">Ano</option>
                            <option value="no">Ne</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              record.isSmoker === "yes"
                                ? "bg-red-100 text-red-700"
                                : record.isSmoker === "no"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {record.isSmoker === "yes"
                              ? "Ano"
                              : record.isSmoker === "no"
                              ? "Ne"
                              : "Neznámo"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={handleSave}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
                              title="Uložit"
                            >
                              <Save size={18} />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition"
                              title="Zrušit"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(record)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                              title="Upravit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                              title="Smazat"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchQuery
                  ? "Žádné záznamy nenalezeny"
                  : "Zatím nemáte žádné záznamy"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
