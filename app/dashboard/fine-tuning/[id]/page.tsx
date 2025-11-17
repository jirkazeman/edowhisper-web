"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles
} from "lucide-react";
import type { ParoRecord, RecordFormData } from "@/lib/types";

export default function FineTuningEditPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<ParoRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showComparison, setShowComparison] = useState(true);

  // Form state
  const [formData, setFormData] = useState<RecordFormData | null>(null);

  // Rating state
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [hoveredStar, setHoveredStar] = useState<number>(0);

  useEffect(() => {
    loadRecord();
  }, [params.id]);

  const loadRecord = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/records");
      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      const foundRecord = result.data?.find((r: ParoRecord) => r.id === params.id);
      if (foundRecord) {
        setRecord(foundRecord);
        setFormData(foundRecord.form_data);

        // Load existing rating if present
        if (foundRecord.quality_rating) {
          setRating(foundRecord.quality_rating);
        }
        if (foundRecord.hygienist_feedback) {
          setFeedback(foundRecord.hygienist_feedback);
        }
      }
    } catch (error) {
      console.error("Failed to load record:", error);
      alert("Nepodařilo se načíst záznam");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!record || !formData || rating === 0) {
      alert("Prosím ohodnoťte záznam před uložením");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/records", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: record.id,
          form_data: formData,
          quality_rating: rating,
          hygienist_feedback: feedback,
          rated_by: record.user_id,
        }),
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      alert("✅ Záznam byl úspěšně uložen!");
      router.push("/dashboard/fine-tuning");
    } catch (error) {
      console.error("Failed to save record:", error);
      alert("❌ Nepodařilo se uložit záznam");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof RecordFormData, value: any) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
  };

  const getOriginalValue = (field: keyof RecordFormData): any => {
    if (!record?.llm_original?.form_data) return null;
    return record.llm_original.form_data[field];
  };

  const hasChanged = (field: keyof RecordFormData): boolean => {
    const currentValue = formData?.[field];
    const originalValue = getOriginalValue(field);
    return JSON.stringify(currentValue) !== JSON.stringify(originalValue);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
          <p className="text-gray-600">Načítání záznamu...</p>
        </div>
      </div>
    );
  }

  if (!record || !formData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Záznam nenalezen</h2>
          <button
            onClick={() => router.push("/dashboard/fine-tuning")}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Zpět na přehled
          </button>
        </div>
      </div>
    );
  }

  const EditableField = ({
    label,
    field,
    multiline = false,
    placeholder = "",
  }: {
    label: string;
    field: keyof RecordFormData;
    multiline?: boolean;
    placeholder?: string;
  }) => {
    const currentValue = formData[field] || "";
    const originalValue = getOriginalValue(field) || "";
    const changed = hasChanged(field);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            {label}
            {changed && (
              <span className="ml-2 text-xs text-orange-600 font-semibold">
                ✏️ Upraveno
              </span>
            )}
          </label>
          {showComparison && originalValue && (
            <button
              onClick={() => updateField(field, originalValue)}
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              Obnovit AI verzi
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2">
          {/* Current/Editable */}
          <div>
            {multiline ? (
              <textarea
                value={currentValue as string}
                onChange={(e) => updateField(field, e.target.value)}
                placeholder={placeholder}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  changed
                    ? "border-orange-400 bg-orange-50"
                    : "border-gray-300 bg-white"
                }`}
              />
            ) : (
              <input
                type="text"
                value={currentValue as string}
                onChange={(e) => updateField(field, e.target.value)}
                placeholder={placeholder}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  changed
                    ? "border-orange-400 bg-orange-50"
                    : "border-gray-300 bg-white"
                }`}
              />
            )}
          </div>

          {/* AI Original Comparison */}
          {showComparison && originalValue && (
            <div className="relative">
              <div className="absolute top-2 left-2 z-10">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                  <Sparkles size={12} />
                  AI původní
                </span>
              </div>
              {multiline ? (
                <textarea
                  value={originalValue as string}
                  readOnly
                  rows={3}
                  className="w-full px-3 py-2 pt-8 border border-purple-200 bg-purple-50/50 rounded-lg text-sm text-gray-600"
                />
              ) : (
                <input
                  type="text"
                  value={originalValue as string}
                  readOnly
                  className="w-full px-3 py-2 border border-purple-200 bg-purple-50/50 rounded-lg text-sm text-gray-600"
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/dashboard/fine-tuning")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Zpět na Fine-Tuning přehled
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Editace pro Fine-Tuning
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {formData.lastName} - {formData.personalIdNumber || "N/A"}
              </p>
            </div>

            <button
              onClick={() => setShowComparison(!showComparison)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              {showComparison ? <Eye size={16} /> : <EyeOff size={16} />}
              {showComparison ? "Skrýt AI porovnání" : "Zobrazit AI porovnání"}
            </button>
          </div>
        </div>

        {/* Rating Section - At Top */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ⭐ Hodnocení AI výstupu
          </h2>

          <div className="space-y-4">
            {/* Stars */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kvalita AI výstupu (povinné)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoveredStar || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {rating === 0 && "⚠️ Vyberte hodnocení před uložením"}
                {rating === 1 && "1 ⭐ - Velmi špatné (nutné kompletní přepsání)"}
                {rating === 2 && "2 ⭐ - Špatné (mnoho chyb a nepřesností)"}
                {rating === 3 && "3 ⭐ - Průměrné (některé chyby, potřebuje úpravy)"}
                {rating === 4 && "4 ⭐ - Dobré (jen malé úpravy)"}
                {rating === 5 && "5 ⭐ - Vynikající (téměř bez úprav)"}
              </div>
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zpětná vazba (volitelné)
                <span className="text-gray-500 font-normal ml-2">
                  - co bylo špatně, co chybělo, co by AI měla zlepšit
                </span>
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                placeholder="Např.: AI správně identifikovala hlavní nálezy, ale chyběly konkrétní hodnoty PBI. Doporučení byla příliš obecná..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Editable Form Sections */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Základní informace
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EditableField label="Příjmení" field="lastName" placeholder="Zadejte příjmení" />
              <EditableField label="Rodné číslo" field="personalIdNumber" placeholder="Zadejte rodné číslo" />
            </div>
          </div>

          {/* Anamnesis */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Anamnéza
            </h2>
            <div className="space-y-4">
              <EditableField
                label="Obecná anamnéza"
                field="generalAnamnesis"
                multiline
                placeholder="Popište obecnou anamnézu pacienta"
              />
              <EditableField
                label="Alergie"
                field="allergies"
                multiline
                placeholder="Zadejte alergie"
              />
              <EditableField
                label="Permanentní medikace"
                field="permanentMedication"
                multiline
                placeholder="Zadejte permanentní medikaci"
              />
              <EditableField
                label="Stomatologická anamnéza"
                field="stomatologicalAnamnesis"
                multiline
                placeholder="Popište stomatologickou anamnézu"
              />
            </div>
          </div>

          {/* Examination */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Vyšetření
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EditableField label="Hygiena" field="hygiene" placeholder="Stav hygieny" />
              <EditableField label="Dásně" field="gingiva" placeholder="Stav dásní" />
              <EditableField label="Zubní kámen" field="tartar" placeholder="Přítomnost kamene" />
              <EditableField label="Kazy" field="caries" placeholder="Přítomnost kazů" />
              <EditableField label="Sliznice" field="mucosa" placeholder="Stav sliznice" />
              <EditableField label="Jazyk" field="tongue" placeholder="Stav jazyka" />
            </div>
          </div>

          {/* PBI */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              PBI (Papilla Bleeding Index)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EditableField label="PBI Hodnoty" field="pbiValues" placeholder="Příklad: 0123/2341/1234/0123" />
              <EditableField
                label="PBI Nástroje"
                field="pbiTools"
                multiline
                placeholder="Použité nástroje"
              />
            </div>
          </div>

          {/* Treatment Record */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Záznam o léčbě
            </h2>
            <div className="mt-4">
              <EditableField
                label="Poznámky uživatele"
                field="userNotes"
                multiline
                placeholder="Další poznámky"
              />
            </div>
          </div>
        </div>

        {/* Save Button - Fixed at bottom */}
        <div className="sticky bottom-0 mt-8 bg-white border-t-2 border-gray-200 p-4 rounded-t-xl shadow-lg">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="text-sm text-gray-600">
              {rating === 0 ? (
                <span className="flex items-center gap-2 text-orange-600">
                  <AlertCircle size={16} />
                  Před uložením musíte ohodnotit záznam
                </span>
              ) : (
                <span className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 size={16} />
                  Záznam je připraven k uložení
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard/fine-tuning")}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Zrušit
              </button>
              <button
                onClick={handleSave}
                disabled={rating === 0 || saving}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  rating === 0 || saving
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                }`}
              >
                <Save size={18} />
                {saving ? "Ukládám..." : "Uložit záznam"}
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">ℹ️ Jak editovat záznam?</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <strong>1.</strong> Zkontrolujte a opravte údaje, které AI vygenerovala špatně
            </p>
            <p>
              <strong>2.</strong> Pole označená ✏️ byla upravena oproti původnímu AI výstupu
            </p>
            <p>
              <strong>3.</strong> Můžete porovnat s původním AI výstupem (fialové pole)
            </p>
            <p>
              <strong>4.</strong> Ohodnoťte celkovou kvalitu AI výstupu (1-5 hvězdiček)
            </p>
            <p>
              <strong>5.</strong> Volitelně přidejte zpětnou vazbu, co bylo špatně
            </p>
            <p>
              <strong>6.</strong> Uložte záznam - AI se z vašich úprav naučí!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
