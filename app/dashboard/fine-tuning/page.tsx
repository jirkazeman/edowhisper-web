"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Star, 
  Download, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  FileJson,
  BarChart3,
  Filter,
  RefreshCw,
  Eye,
  MessageSquare
} from "lucide-react";
import type { ParoRecord } from "@/lib/types";

interface FineTuningStats {
  total: number;
  rated: number;
  unrated: number;
  avgRating: number;
  byRating: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  withFeedback: number;
  readyForExport: number;
}

export default function FineTuningPage() {
  const router = useRouter();
  const [records, setRecords] = useState<ParoRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ParoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState<FineTuningStats | null>(null);
  const [filterRating, setFilterRating] = useState<number | "all" | "unrated">("all");
  const [filterFeedback, setFilterFeedback] = useState<boolean | "all">("all");

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [records, filterRating, filterFeedback]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/records");
      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      const data = result.data || [];
      setRecords(data);
      calculateStats(data);
    } catch (error) {
      console.error("Failed to load records:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: ParoRecord[]) => {
    const recordsWithOriginal = data.filter(r => r.llm_original);
    const rated = recordsWithOriginal.filter(r => r.quality_rating);
    const unrated = recordsWithOriginal.filter(r => !r.quality_rating);

    const byRating = {
      5: rated.filter(r => r.quality_rating === 5).length,
      4: rated.filter(r => r.quality_rating === 4).length,
      3: rated.filter(r => r.quality_rating === 3).length,
      2: rated.filter(r => r.quality_rating === 2).length,
      1: rated.filter(r => r.quality_rating === 1).length,
    };

    const avgRating = rated.length > 0
      ? rated.reduce((sum, r) => sum + (r.quality_rating || 0), 0) / rated.length
      : 0;

    const withFeedback = rated.filter(r => r.hygienist_feedback && r.hygienist_feedback.trim() !== "").length;
    const readyForExport = byRating[4] + byRating[5]; // Rating >= 4

    setStats({
      total: recordsWithOriginal.length,
      rated: rated.length,
      unrated: unrated.length,
      avgRating,
      byRating,
      withFeedback,
      readyForExport,
    });
  };

  const applyFilters = () => {
    let filtered = records.filter(r => r.llm_original);

    // Filter by rating
    if (filterRating === "unrated") {
      filtered = filtered.filter(r => !r.quality_rating);
    } else if (filterRating !== "all") {
      filtered = filtered.filter(r => r.quality_rating === filterRating);
    }

    // Filter by feedback
    if (filterFeedback === true) {
      filtered = filtered.filter(r => r.hygienist_feedback && r.hygienist_feedback.trim() !== "");
    } else if (filterFeedback === false) {
      filtered = filtered.filter(r => !r.hygienist_feedback || r.hygienist_feedback.trim() === "");
    }

    setFilteredRecords(filtered);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await fetch("/api/fine-tuning/export", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fine-tuning-data-${new Date().toISOString().split('T')[0]}.jsonl`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert("✅ Export dokončen! Soubor byl stažen.");
    } catch (error) {
      console.error("Export failed:", error);
      alert("❌ Export selhal. Zkuste to prosím znovu.");
    } finally {
      setExporting(false);
    }
  };

  const getRecommendation = (): { message: string; color: string; icon: any } => {
    if (!stats) return { message: "", color: "", icon: null };

    if (stats.readyForExport >= 200) {
      return {
        message: "Máte dostatek kvalitních dat! Můžete spustit fine-tuning.",
        color: "green",
        icon: CheckCircle,
      };
    } else if (stats.readyForExport >= 100) {
      return {
        message: `Dobře na cestě! ${200 - stats.readyForExport} kvalitních hodnocení do doporučeného minima.`,
        color: "blue",
        icon: TrendingUp,
      };
    } else if (stats.readyForExport >= 50) {
      return {
        message: `Ještě potřebujete ${200 - stats.readyForExport} kvalitních hodnocení (rating ≥4).`,
        color: "yellow",
        icon: AlertCircle,
      };
    } else {
      return {
        message: `Začněte hodnotit záznamy! Cíl: 200 kvalitních hodnocení.`,
        color: "red",
        icon: AlertCircle,
      };
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
            <p className="text-gray-500">Načítání dat...</p>
          </div>
        </div>
      </div>
    );
  }

  const recommendation = getRecommendation();
  const RecommendationIcon = recommendation.icon;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤖 Fine-Tuning Management
          </h1>
          <p className="text-gray-600">
            Spravujte hodnocení AI výstupů a připravte data pro fine-tuning OpenAI modelů
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Records */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Záznamy s AI výstupem</span>
                <FileJson className="text-blue-500" size={20} />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-500 mt-1">
                Celkem záznamů k hodnocení
              </div>
            </div>

            {/* Rated */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Ohodnoceno</span>
                <Star className="text-yellow-500" size={20} />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.rated}</div>
              <div className="text-xs text-gray-500 mt-1">
                Zbývá: {stats.unrated} záznamů
              </div>
              {stats.total > 0 && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{ width: `${(stats.rated / stats.total) * 100}%` }}
                  />
                </div>
              )}
            </div>

            {/* Average Rating */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Průměrné hodnocení</span>
                <BarChart3 className="text-green-500" size={20} />
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-gray-900">
                  {stats.avgRating.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">/ 5.00</div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Ze zpětné vazby hygienistek
              </div>
            </div>

            {/* Ready for Export */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Připraveno k exportu</span>
                <CheckCircle className="text-green-500" size={20} />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.readyForExport}</div>
              <div className="text-xs text-gray-500 mt-1">
                Kvalitní záznamy (rating ≥4)
              </div>
            </div>
          </div>
        )}

        {/* Recommendation Banner */}
        {stats && recommendation.message && (
          <div
            className={`mb-8 rounded-xl p-6 border-2 ${
              recommendation.color === "green"
                ? "bg-green-50 border-green-200"
                : recommendation.color === "blue"
                ? "bg-blue-50 border-blue-200"
                : recommendation.color === "yellow"
                ? "bg-yellow-50 border-yellow-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-start gap-4">
              {RecommendationIcon && (
                <RecommendationIcon
                  className={`flex-shrink-0 ${
                    recommendation.color === "green"
                      ? "text-green-600"
                      : recommendation.color === "blue"
                      ? "text-blue-600"
                      : recommendation.color === "yellow"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                  size={24}
                />
              )}
              <div className="flex-1">
                <h3
                  className={`font-semibold mb-1 ${
                    recommendation.color === "green"
                      ? "text-green-900"
                      : recommendation.color === "blue"
                      ? "text-blue-900"
                      : recommendation.color === "yellow"
                      ? "text-yellow-900"
                      : "text-red-900"
                  }`}
                >
                  {recommendation.message}
                </h3>
                {stats.readyForExport >= 100 && (
                  <p
                    className={`text-sm ${
                      recommendation.color === "green"
                        ? "text-green-700"
                        : recommendation.color === "blue"
                        ? "text-blue-700"
                        : "text-yellow-700"
                    }`}
                  >
                    Pokračujte v hodnocení nebo exportujte aktuální data pro první iteraci fine-tuningu.
                  </p>
                )}
              </div>
              {stats.readyForExport >= 50 && (
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    exporting
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <Download size={18} />
                  {exporting ? "Exportuji..." : "Exportovat data"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Rating Distribution */}
        {stats && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribuce hodnocení</h2>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.byRating[rating as keyof typeof stats.byRating];
                const percentage = stats.rated > 0 ? (count / stats.rated) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-4">
                    <div className="flex items-center gap-1 w-24">
                      {Array.from({ length: rating }).map((_, i) => (
                        <Star key={i} className="text-yellow-400 fill-yellow-400" size={14} />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">({rating})</span>
                    </div>
                    <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          rating >= 4
                            ? "bg-green-500"
                            : rating === 3
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-20 text-right">
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm">
              <span className="text-gray-600">
                <MessageSquare className="inline mr-1" size={14} />
                Se zpětnou vazbou: {stats.withFeedback} / {stats.rated}
              </span>
              <span className="text-gray-600">
                {stats.rated > 0 && `${((stats.withFeedback / stats.rated) * 100).toFixed(0)}% záznamů má feedback`}
              </span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtry</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hodnocení
              </label>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value === "all" ? "all" : e.target.value === "unrated" ? "unrated" : Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Vše</option>
                <option value="unrated">Neohodnoceno</option>
                <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                <option value="4">⭐⭐⭐⭐ (4)</option>
                <option value="3">⭐⭐⭐ (3)</option>
                <option value="2">⭐⭐ (2)</option>
                <option value="1">⭐ (1)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zpětná vazba
              </label>
              <select
                value={filterFeedback === "all" ? "all" : filterFeedback ? "yes" : "no"}
                onChange={(e) => setFilterFeedback(e.target.value === "all" ? "all" : e.target.value === "yes")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Vše</option>
                <option value="yes">S feedbackem</option>
                <option value="no">Bez feedbacku</option>
              </select>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Záznamy ({filteredRecords.length})
            </h2>
            <button
              onClick={loadRecords}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              <RefreshCw size={16} />
              Obnovit
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pacient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vytvořeno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hodnocení
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zpětná vazba
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => router.push(`/dashboard/fine-tuning/${record.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {record.form_data?.lastName || "Bez jména"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {record.form_data?.personalIdNumber || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.created_at).toLocaleDateString("cs-CZ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.quality_rating ? (
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {Array.from({ length: record.quality_rating }).map((_, i) => (
                              <Star key={i} className="text-yellow-400 fill-yellow-400" size={14} />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">({record.quality_rating})</span>
                        </div>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                          Neohodnoceno
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {record.hygienist_feedback && record.hygienist_feedback.trim() !== "" ? (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle size={14} />
                          <span>Ano</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/fine-tuning/${record.id}`);
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Eye size={14} />
                        {record.quality_rating ? "Upravit" : "Editovat & Ohodnotit"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Žádné záznamy nenalezeny</p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">ℹ️ Jak to funguje?</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <strong>1.</strong> Hygienistky nahrají audio a AI vytvoří strukturovaný záznam
            </p>
            <p>
              <strong>2.</strong> Ve volném čase opraví případné chyby a ohodnotí kvalitu AI výstupu
            </p>
            <p>
              <strong>3.</strong> Když nahromadíte dostatek kvalitních hodnocení (200+), exportujte data
            </p>
            <p>
              <strong>4.</strong> Spusťte fine-tuning na OpenAI a získejte vlastní vylepšený model
            </p>
            <p>
              <strong>5.</strong> Model se s každou iterací zlepšuje a šetří vám stále více času!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}






