"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ParoRecord } from "@/lib/types";

export default function TVDisplayPage() {
  const [records, setRecords] = useState<ParoRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
    const interval = setInterval(fetchRecords, 30000); // Refresh každých 30s
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate záznamy každých 10 sekund
  useEffect(() => {
    if (records.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % records.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [records.length]);

  const fetchRecords = async () => {
    try {
      if (!supabase) {
        console.warn("Supabase not configured, using mock data");
        setRecords(getMockData());
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("paro_records")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Supabase error:", error);
        // Fallback na mockup data pro demo
        setRecords(getMockData());
      } else if (data && data.length > 0) {
        setRecords(data);
      } else {
        // Žádná data - použij mockup
        console.log("No records found, using mock data");
        setRecords(getMockData());
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      // Fallback na mockup data
      setRecords(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = (): ParoRecord[] => {
    return [
      {
        id: "mock-1",
        user_id: "mock-user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        protocol: null,
        appointment_at: null,
        deleted: false,
        deleted_at: null,
        examination_summary: "MOCK DATA - Kontrola parodontu, absence zubů 16, 46",
        form_data: {
          lastName: "Nováková",
          personalIdNumber: "855215/1234",
          isSmoker: "no",
          generalAnamnesis: "Diabetes mellitus typ 2, hypertonik",
          allergies: "Penicilin",
          stomatologicalAnamnesis: "Paradontóza, ztráta zubů 16, 46",
          permanentMedication: "Metformin 500mg 2x denně",
          hygiene: "Velmi dobrá",
          gingiva: "Lehký zánět v oblasti 36-37",
          tartar: "Minimální v dolním frontálním úseku",
          tools: "Mezizubní kartáčky, elektrický kartáček",
          caries: "Zub 26 - počínající kaz",
          mucosa: "Bez patologie",
          tongue: "Povlak - doporučena čistka",
          frenulum: "Fyziologické",
          occlusion: "Třída I dle Anglea",
          orthodonticAnomaly: "Bez anomálií",
          dentalCross: {
            "26": { id: "26", status: "filling", hasCaries: true, note: "Počínající kaz" },
            "36": { id: "36", status: "crown", note: "Metalokeramická korunka" },
            "37": { id: "37", status: "filling", note: "Amalgámová výplň" },
            "16": { id: "16", status: "missing", note: "Extrakce 2020" },
            "46": { id: "46", status: "missing", note: "Extrakce 2018" },
            "11": { id: "11", status: "healthy" },
            "21": { id: "21", status: "healthy" },
            "48": { id: "48", status: "implant", note: "Implantát + korunka" },
          },
          dentalCrossNotes: "Zub 26 vyžaduje ošetření, 36 korunka funkční",
          pbiValues: "0123/2341/1234/0123",
          pbiTools: "Parodontální sonda",
          cpitn: "102/121",
          treatmentRecord: "Provedena profesionální hygiena:\n- Odstranění zubního kamene ultrazvukem\n- Air-Flow čištění\n- Leštění zubů\n- Fluoridace\n- Edukace o správné technice čištění\n- Doporučení kontroly za 6 měsíců",
          examinationSummary: "",
          userNotes: "",
          fullTranscript: "",
        },
      },
    ];
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Načítám záznamy...</p>
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <p className="text-2xl text-gray-600">Žádné záznamy k zobrazení</p>
        </div>
      </div>
    );
  }

  const currentRecord = records[currentIndex];
  const formData = currentRecord.form_data;

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-12 py-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-2xl font-bold">🦷</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Dental AI Scribe</h1>
              <p className="text-blue-100 text-sm">Ordinace - Přehled vyšetření</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{formData.lastName || "Pacient"}</div>
            <div className="text-blue-100 text-lg">
              {formData.personalIdNumber || "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="h-[calc(100vh-120px)] grid grid-cols-12 gap-6 p-6">
        {/* LEFT COLUMN - Anamnéza & Základní info */}
        <div className="col-span-3 space-y-4 overflow-y-auto">
          {/* Základní informace */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100">
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">📋</span> Základní údaje
            </h3>
            <div className="space-y-3">
              <InfoRow label="Kuřák" value={formData.isSmoker === "yes" ? "Ano" : formData.isSmoker === "no" ? "Ne" : "—"} />
              <InfoRow label="Hygiena" value={formData.hygiene} />
              <InfoRow label="Dásně" value={formData.gingiva} />
              <InfoRow label="Zubní kámen" value={formData.tartar} />
            </div>
          </div>

          {/* Anamnéza */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100">
            <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">🩺</span> Anamnéza
            </h3>
            <div className="space-y-3 text-sm">
              {formData.generalAnamnesis && (
                <TextBlock label="Všeobecná" text={formData.generalAnamnesis} />
              )}
              {formData.allergies && (
                <TextBlock label="Alergie" text={formData.allergies} color="red" />
              )}
              {formData.stomatologicalAnamnesis && (
                <TextBlock label="Stomatologická" text={formData.stomatologicalAnamnesis} />
              )}
              {formData.permanentMedication && (
                <TextBlock label="Medikace" text={formData.permanentMedication} />
              )}
            </div>
          </div>

          {/* Vyšetření */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100">
            <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">🔍</span> Vyšetření
            </h3>
            <div className="space-y-2 text-sm">
              <InfoRow label="Kaz" value={formData.caries} />
              <InfoRow label="Sliznice" value={formData.mucosa} />
              <InfoRow label="Jazyk" value={formData.tongue} />
              <InfoRow label="Frenulum" value={formData.frenulum} />
              <InfoRow label="Okluze" value={formData.occlusion} />
              <InfoRow label="Anomálie" value={formData.orthodonticAnomaly} />
              <InfoRow label="Pomůcky" value={formData.tools} />
            </div>
          </div>
        </div>

        {/* CENTER COLUMN - Zubní kříž (NEJVĚTŠÍ) */}
        <div className="col-span-6 space-y-4">
          {/* Zubní kříž */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-200 h-full">
            <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center justify-center">
              <span className="text-3xl mr-3">🦷</span> Stav chrupu (FDI)
            </h3>
            
            <DentalChart dentalCross={formData.dentalCross || {}} />
            
            {/* Poznámky ke kříži */}
            {formData.dentalCrossNotes && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-2">📝 Poznámky:</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{formData.dentalCrossNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - Indexy & Ošetření */}
        <div className="col-span-3 space-y-4 overflow-y-auto">
          {/* PBI */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-100">
            <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">📊</span> PBI Index
            </h3>
            <div className="space-y-2">
              <InfoRow label="Hodnoty" value={formData.pbiValues} bold />
              <InfoRow label="Pomůcky" value={formData.pbiTools} />
            </div>
          </div>

          {/* CPITN */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-teal-100">
            <h3 className="text-xl font-bold text-teal-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">📈</span> CPITN
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {formData.cpitn ? (
                <>
                  <CPITNBox label="Horní" value={formData.cpitn.split('/')[0] || ''} />
                  <CPITNBox label="Dolní" value={formData.cpitn.split('/')[1] || ''} />
                </>
              ) : (
                <div className="col-span-2 text-gray-400 text-center">Žádná data</div>
              )}
            </div>
          </div>

          {/* Záznam o ošetření */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-indigo-100">
            <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">✍️</span> Ošetření
            </h3>
            {formData.treatmentRecord ? (
              <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {formData.treatmentRecord}
              </div>
            ) : (
              <p className="text-gray-400 text-sm italic">Žádný záznam</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer - Navigation */}
      {records.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + records.length) % records.length)}
            className="w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center"
          >
            ←
          </button>
          <div className="flex space-x-2">
            {records.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-3 h-3 rounded-full transition ${
                  idx === currentIndex ? "bg-blue-600 scale-125" : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % records.length)}
            className="w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-700 transition flex items-center justify-center"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}

// Helper Components
function InfoRow({ label, value, bold = false }: { label: string; value?: string; bold?: boolean }) {
  if (!value || value === "—") return null;
  return (
    <div className="flex justify-between items-start py-1 border-b border-gray-100">
      <span className="text-gray-600 text-sm font-medium">{label}:</span>
      <span className={`text-gray-900 text-sm text-right ml-2 ${bold ? "font-bold text-lg" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function TextBlock({ label, text, color = "blue" }: { label: string; text: string; color?: string }) {
  const colors = {
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    red: "bg-red-50 border-red-200 text-red-900",
    green: "bg-green-50 border-green-200 text-green-900",
  };
  
  return (
    <div className={`p-3 rounded-lg border ${colors[color as keyof typeof colors] || colors.blue}`}>
      <p className="font-semibold text-xs mb-1">{label}:</p>
      <p className="text-xs leading-relaxed">{text}</p>
    </div>
  );
}

function CPITNBox({ label, value }: { label: string; value?: string | null }) {
  const getColor = (val?: string | null) => {
    if (!val) return "bg-gray-100 text-gray-400";
    const num = parseInt(val);
    if (num === 0) return "bg-green-100 text-green-700 border-green-300";
    if (num === 1) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    if (num === 2) return "bg-orange-100 text-orange-700 border-orange-300";
    if (num >= 3) return "bg-red-100 text-red-700 border-red-300";
    return "bg-gray-100 text-gray-400";
  };

  return (
    <div className={`p-3 rounded-xl border-2 text-center ${getColor(value)}`}>
      <div className="text-xs font-semibold mb-1">{label}</div>
      <div className="text-2xl font-bold">{value || "—"}</div>
    </div>
  );
}

function DentalChart({ dentalCross }: { dentalCross: any }) {
  const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  const getToothColor = (toothId: number) => {
    const tooth = dentalCross[toothId.toString()];
    if (!tooth) return "bg-white border-gray-300";
    
    if (tooth.hasCaries) return "bg-red-100 border-red-400";
    if (tooth.status === "missing") return "bg-gray-300 border-gray-400";
    if (tooth.status === "crown") return "bg-yellow-100 border-yellow-400";
    if (tooth.status === "filling") return "bg-blue-100 border-blue-400";
    if (tooth.status === "root_canal") return "bg-purple-100 border-purple-400";
    if (tooth.status === "implant") return "bg-green-100 border-green-400";
    
    return "bg-white border-gray-300";
  };

  const getToothIcon = (toothId: number) => {
    const tooth = dentalCross[toothId.toString()];
    if (!tooth) return null;
    
    if (tooth.hasCaries) return "⚠️";
    if (tooth.status === "missing") return "✕";
    if (tooth.status === "crown") return "👑";
    if (tooth.status === "filling") return "🔧";
    if (tooth.status === "root_canal") return "🔴";
    if (tooth.status === "implant") return "🔩";
    
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Horní řada */}
      <div className="flex justify-center space-x-2">
        {upperTeeth.map((toothId) => (
          <div key={toothId} className="flex flex-col items-center">
            <div className="text-xs text-gray-500 font-semibold mb-1">{toothId}</div>
            <div
              className={`w-12 h-16 rounded-lg border-2 flex items-center justify-center text-lg font-bold transition shadow-sm ${getToothColor(
                toothId
              )}`}
            >
              {getToothIcon(toothId)}
            </div>
          </div>
        ))}
      </div>

      {/* Separator */}
      <div className="border-t-2 border-dashed border-gray-300"></div>

      {/* Dolní řada */}
      <div className="flex justify-center space-x-2">
        {lowerTeeth.map((toothId) => (
          <div key={toothId} className="flex flex-col items-center">
            <div
              className={`w-12 h-16 rounded-lg border-2 flex items-center justify-center text-lg font-bold transition shadow-sm ${getToothColor(
                toothId
              )}`}
            >
              {getToothIcon(toothId)}
            </div>
            <div className="text-xs text-gray-500 font-semibold mt-1">{toothId}</div>
          </div>
        ))}
      </div>

      {/* Legenda */}
      <div className="mt-6 grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-100 border-2 border-red-400 rounded"></div>
          <span>Kaz</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded"></div>
          <span>Korunka</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded"></div>
          <span>Výplň</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-300 border-2 border-gray-400 rounded"></div>
          <span>Chybí</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-100 border-2 border-purple-400 rounded"></div>
          <span>Endodont</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded"></div>
          <span>Implantát</span>
        </div>
      </div>
    </div>
  );
}

