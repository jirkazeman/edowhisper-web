"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ZoomIn, ZoomOut } from "lucide-react";
import type { ParoRecord } from "@/lib/types";
import DentalChartWithImage from "@/components/DentalChartWithImage";

export default function RecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<ParoRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(100); // 100% = default

  useEffect(() => {
    async function loadRecord() {
      try {
        console.log("🔍 Fetching record:", params.id);
        const response = await fetch("/api/records");
        const result = await response.json();
        
        console.log("📦 API Response:", result);
        
        if (result.error) throw new Error(result.error);
        
        const foundRecord = result.data?.find((r: ParoRecord) => r.id === params.id);
        
        console.log("✅ Found record:", foundRecord);
        
        if (foundRecord) {
          setRecord(foundRecord);
        } else {
          setError("Záznam nenalezen");
        }
      } catch (err) {
        console.error("❌ Failed to load record:", err);
        setError(err instanceof Error ? err.message : "Neznámá chyba");
      } finally {
        setLoading(false);
      }
    }
    loadRecord();
  }, [params.id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Načítání záznamu...</p>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Chyba: {error || "Záznam nenalezen"}</p>
          <button onClick={() => router.back()} className="text-blue-600 hover:underline">
            ← Zpět na záznamy
          </button>
        </div>
      </div>
    );
  }

  const fd = record.form_data;

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-gray-900">{fd.lastName || "Bez jména"}</h1>
        </div>
        
        {/* Zoom controls */}
        <div className="flex items-center gap-2 border-l pl-3">
          <button 
            onClick={() => setFontSize(Math.max(70, fontSize - 10))}
            className="p-1.5 hover:bg-gray-100 rounded"
            title="Zmenšit text"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-xs text-gray-600 w-10 text-center">{fontSize}%</span>
          <button 
            onClick={() => setFontSize(Math.min(150, fontSize + 10))}
            className="p-1.5 hover:bg-gray-100 rounded"
            title="Zvětšit text"
          >
            <ZoomIn size={18} />
          </button>
        </div>
        
        <div className="text-sm text-gray-500">{new Date(record.created_at).toLocaleDateString("cs-CZ")}</div>
      </div>

      {/* Main content - 3 columns */}
      <div 
        className="flex-1 grid grid-cols-[350px_1fr_400px] gap-3 p-3 min-h-0"
        style={{ fontSize: `${fontSize}%` }}
      >
        
        {/* LEFT COLUMN */}
        <div className="space-y-3 overflow-y-auto">
          {/* Základní informace */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-sm mb-3">Základní informace</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Příjmení</label>
                <input type="text" value={fd.lastName || ""} readOnly className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Rodné číslo (RČ)</label>
                <input type="text" value={fd.personalIdNumber || ""} readOnly className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Kuřák</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={fd.isSmoker === "yes"} readOnly />
                    <span className="text-sm">Ano</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={fd.isSmoker === "no"} readOnly />
                    <span className="text-sm">Ne</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Anamnéza */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-sm mb-3">Anamnéza</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Všeobecná anamnéza</label>
                <textarea value={fd.generalAnamnesis || ""} readOnly rows={2} className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Alergie</label>
                <textarea value={fd.allergies || ""} readOnly rows={2} className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Stomatologická anamnéza</label>
                <textarea value={fd.stomatologicalAnamnesis || ""} readOnly rows={2} className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none" />
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div className="space-y-3 overflow-y-auto">
          {/* Stav chrupu (zubní kříž) */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-sm mb-3">Stav chrupu (zubní kříž)</h3>
            
            {/* Dental chart with image background */}
            <DentalChartWithImage 
              teeth={fd.dentalCross}
              notes={fd.dentalCrossNotes}
            />
          </div>

          {/* Záznam o ošetření */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-sm mb-3">Záznam o ošetření</h3>
            <textarea value={fd.treatmentRecord || ""} readOnly rows={4} className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none" />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-3 overflow-y-auto">
          {/* Vyšetření */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-sm mb-3">Vyšetření</h3>
            
            <div className="space-y-2">
              {[
                { label: "Hygiena", value: fd.hygiene },
                { label: "Gingiva", value: fd.gingiva },
                { label: "Zubní kámen", value: fd.tartar },
                { label: "Pomůcky", value: fd.tools }
              ].map(({ label, value }) => (
                <div key={label}>
                  <label className="block text-xs text-gray-600 mb-1">{label}</label>
                  <input type="text" value={value || ""} readOnly className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Indexy (BOP/PBI, CPITN) */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-sm mb-3">Indexy (BOP/PBI, CPITN)</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">BOP / PBI Protokol</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">Datum</label>
                    <input type="date" value={fd.pbiDate || ""} readOnly className="w-full px-2 py-1 border border-gray-300 rounded text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">Výsledek</label>
                    <input type="text" value={fd.pbiResult || ""} readOnly className="w-full px-2 py-1 border border-gray-300 rounded text-xs" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Pomůcky</label>
                <input type="text" value={fd.pbiTools || ""} readOnly className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
