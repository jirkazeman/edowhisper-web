"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, Check } from "lucide-react";
import type { ParoRecord } from "@/lib/types";
import DentalChartProfessional from "@/components/DentalChartProfessional";

export default function RecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<ParoRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text || "");
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (loading || !record) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const fd = record.form_data;

  const F = ({ l, v }: { l: string; v?: string | null }) => (
    <div className="flex gap-1 text-[9px]">
      <span className="text-gray-500 shrink-0">{l}:</span>
      <span className="font-medium truncate">{v || "-"}</span>
    </div>
  );

  const S = ({ title, children, copy }: { title: string; children: React.ReactNode; copy?: string }) => (
    <div className="bg-white rounded p-1.5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-[10px] font-semibold text-gray-700">{title}</h4>
        {copy && (
          <button onClick={() => copyToClipboard(copy, title)} className="p-0.5 hover:bg-gray-100 rounded">
            {copiedField === title ? <Check size={10} className="text-green-600" /> : <Copy size={10} className="text-gray-400" />}
          </button>
        )}
      </div>
      {children}
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Minimal header */}
      <div className="bg-white border-b px-2 py-1 flex items-center gap-2 shrink-0">
        <button onClick={() => router.back()} className="p-0.5 hover:bg-gray-100 rounded">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold truncate">{fd.lastName || "Bez jména"} • {fd.personalIdNumber || "N/A"}</div>
        </div>
        <div className="text-[9px] text-gray-500">{new Date(record.created_at).toLocaleDateString("cs-CZ")}</div>
      </div>

      {/* Main content - NO SCROLLING, 100% screen usage */}
      <div className="flex-1 grid grid-cols-[200px_1fr_200px] gap-1 p-1 min-h-0">
        
        {/* LEFT */}
        <div className="space-y-1 overflow-y-auto">
          <S title="Pacient">
            <div className="space-y-0.5">
              <F l="Příjmení" v={fd.lastName} />
              <F l="RČ" v={fd.personalIdNumber} />
              <F l="Kuřák" v={fd.isSmoker === "yes" ? "Ano" : fd.isSmoker === "no" ? "Ne" : "-"} />
            </div>
          </S>

          <S title="Anamnéza">
            <div className="space-y-0.5">
              <F l="Obecná" v={fd.generalAnamnesis} />
              <F l="Alergie" v={fd.allergies} />
              <F l="Medikace" v={fd.permanentMedication} />
              <F l="Stomato" v={fd.stomatologicalAnamnesis} />
            </div>
          </S>

          <S title="Vyšetření">
            <div className="space-y-0.5">
              <F l="Hygiena" v={fd.hygiene} />
              <F l="Dásně" v={fd.gingiva} />
              <F l="Kámen" v={fd.tartar} />
              <F l="Pomůcky" v={fd.tools} />
              <F l="Kaz" v={fd.caries} />
              <F l="Sliznice" v={fd.mucosa} />
              <F l="Jazyk" v={fd.tongue} />
            </div>
          </S>

          <S title="PBI/CPITN">
            <div className="space-y-0.5">
              <F l="PBI" v={fd.pbiResult} />
              <F l="HR" v={fd.cpitnUpperRight} />
              <F l="HL" v={fd.cpitnUpperLeft} />
              <F l="DL" v={fd.cpitnLowerLeft} />
              <F l="DR" v={fd.cpitnLowerRight} />
            </div>
          </S>
        </div>

        {/* CENTER */}
        <div className="space-y-1 overflow-y-auto">
          <DentalChartProfessional teeth={fd.dentalCross} notes={fd.dentalCrossNotes} />

          <S title="Záznam o ošetření">
            <div className="text-[9px] leading-tight bg-gray-50 p-1 rounded max-h-[80px] overflow-y-auto">
              {fd.treatmentRecord || "-"}
            </div>
          </S>

          <S title="Přehled o ošetření" copy={fd.examinationSummary || ""}>
            <div className="text-[9px] leading-tight bg-blue-50 p-1 rounded border border-blue-200 max-h-[100px] overflow-y-auto">
              {fd.examinationSummary || "-"}
            </div>
          </S>
        </div>

        {/* RIGHT */}
        <div className="space-y-1 overflow-y-auto">
          <S title="Poznámky">
            <div className="text-[9px] leading-tight bg-gray-50 p-1 rounded min-h-[40px] max-h-[100px] overflow-y-auto">
              {fd.userNotes || "-"}
            </div>
          </S>

          <S title="Poznámky ke kříži">
            <div className="text-[9px] leading-tight bg-gray-50 p-1 rounded min-h-[40px] max-h-[80px] overflow-y-auto">
              {fd.dentalCrossNotes || "-"}
            </div>
          </S>

          <S title="Celý přepis" copy={fd.fullTranscript || ""}>
            <div className="text-[8px] leading-tight bg-gray-50 p-1 rounded font-mono max-h-[200px] overflow-y-auto">
              {fd.fullTranscript || "-"}
            </div>
          </S>
        </div>
      </div>
    </div>
  );
}

