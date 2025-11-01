"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { ParoRecord } from "@/lib/types";

export default function RecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<ParoRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecord() {
      try {
        const response = await fetch("/api/records");
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        const foundRecord = result.data?.find((r: ParoRecord) => r.id === params.id);
        if (foundRecord) setRecord(foundRecord);
      } catch (error) {
        console.error("Failed to load record:", error);
      } finally {
        setLoading(false);
      }
    }
    loadRecord();
  }, [params.id]);

  if (loading || !record) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const fd = record.form_data;

  // Tooth numbers for dental chart
  const upperTeeth = [
    ["18", "17", "16", "15", "14", "13", "12", "11"],
    ["21", "22", "23", "24", "25", "26", "27", "28"]
  ];
  const lowerTeeth = [
    ["48", "47", "46", "45", "44", "43", "42", "41"],
    ["31", "32", "33", "34", "35", "36", "37", "38"]
  ];

  const ToothBox = ({ num }: { num: string }) => {
    const tooth = fd.dentalCross?.[num];
    const hasData = tooth && (tooth.status || tooth.note || tooth.hasCaries);
    
    return (
      <div 
        className={`h-12 border border-gray-300 flex items-center justify-center text-xs font-medium ${
          hasData ? 'bg-blue-50 border-blue-400' : 'bg-white'
        }`}
        title={tooth?.note || undefined}
      >
        {num}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{fd.lastName || "Bez jména"}</h1>
        </div>
        <div className="text-sm text-gray-500">{new Date(record.created_at).toLocaleDateString("cs-CZ")}</div>
      </div>

      {/* Main content - 3 columns */}
      <div className="flex-1 grid grid-cols-[350px_1fr_400px] gap-3 p-3 min-h-0">
        
        {/* LEFT COLUMN */}
        <div className="space-y-3 overflow-y-auto">
          {/* Základní informace */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-sm">≡</span>
              </div>
              <h3 className="font-semibold text-sm">Základní informace</h3>
            </div>
            
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
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-sm text-blue-600">📋</span>
              </div>
              <h3 className="font-semibold text-sm">Anamnéza</h3>
            </div>
            
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
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-sm text-white">🦷</span>
              </div>
              <h3 className="font-semibold text-sm">Stav chrupu (zubní kříž)</h3>
            </div>
            
            {/* Upper teeth */}
            <div className="grid grid-cols-16 gap-px mb-1">
              {upperTeeth[0].map(num => <ToothBox key={num} num={num} />)}
              {upperTeeth[1].map(num => <ToothBox key={num} num={num} />)}
            </div>
            
            {/* Lower teeth */}
            <div className="grid grid-cols-16 gap-px mb-3">
              {lowerTeeth[0].map(num => <ToothBox key={num} num={num} />)}
              {lowerTeeth[1].map(num => <ToothBox key={num} num={num} />)}
            </div>

            {/* Manuální záznam ke kříži */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Manuální záznam ke kříži</label>
              <textarea value={fd.dentalCrossNotes || ""} readOnly rows={3} className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none" />
            </div>
          </div>

          {/* Záznam o ošetření */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-sm">✏️</span>
              </div>
              <h3 className="font-semibold text-sm">Záznam o ošetření</h3>
            </div>
            <textarea value={fd.treatmentRecord || ""} readOnly rows={4} className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none" />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-3 overflow-y-auto">
          {/* Vyšetření */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-sm">🔍</span>
              </div>
              <h3 className="font-semibold text-sm">Vyšetření</h3>
            </div>
            
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
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-sm">≡</span>
              </div>
              <h3 className="font-semibold text-sm">Indexy (BOP/PBI, CPITN)</h3>
            </div>
            
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
