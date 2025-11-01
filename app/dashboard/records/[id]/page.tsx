"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, Check } from "lucide-react";
import type { ParoRecord } from "@/lib/types";
import DentalChart from "@/components/DentalChart";

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

        if (result.error) {
          throw new Error(result.error);
        }

        const foundRecord = result.data?.find((r: ParoRecord) => r.id === params.id);
        if (foundRecord) {
          setRecord(foundRecord);
        }
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Záznam nenalezen</p>
      </div>
    );
  }

  const fd = record.form_data;

  const Field = ({ label, value, className = "" }: { label: string; value?: string | null; className?: string }) => (
    <div className={className}>
      <span className="text-gray-500 text-[10px]">{label}:</span>{" "}
      <span className="font-medium text-xs">{value || "-"}</span>
    </div>
  );

  const Section = ({ title, children, copyText }: { title: string; children: React.ReactNode; copyText?: string }) => (
    <div className="bg-white rounded p-2 shadow-sm">
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-xs font-semibold text-gray-700">{title}</h3>
        {copyText && (
          <button
            onClick={() => copyToClipboard(copyText, title)}
            className="p-1 hover:bg-gray-100 rounded transition"
            title="Kopírovat do schránky"
          >
            {copiedField === title ? (
              <Check size={14} className="text-green-600" />
            ) : (
              <Copy size={14} className="text-gray-400" />
            )}
          </button>
        )}
      </div>
      <div className="space-y-0.5 text-xs">{children}</div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Ultra-compact header */}
      <div className="bg-white border-b border-gray-200 px-3 py-1.5 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-gray-900">
            {fd.lastName || "Bez jména"} • {fd.personalIdNumber || "N/A"}
          </h1>
        </div>
        <div className="ml-auto text-[10px] text-gray-500">
          {new Date(record.created_at).toLocaleDateString("cs-CZ", { 
            day: "2-digit", 
            month: "2-digit", 
            year: "numeric" 
          })}
        </div>
      </div>

      {/* Main content - 3 columns with 97% space utilization */}
      <div className="flex-1 grid grid-cols-[minmax(200px,1fr)_minmax(400px,2fr)_minmax(200px,1fr)] gap-1.5 p-1.5 overflow-hidden">
        
        {/* LEFT COLUMN - Patient Info & Anamnesis */}
        <div className="space-y-1.5 overflow-y-auto pr-1">
          <Section title="Pacient">
            <Field label="Příjmení" value={fd.lastName} />
            <Field label="Rodné číslo" value={fd.personalIdNumber} />
            <Field label="Kuřák" value={fd.isSmoker === "yes" ? "Ano" : fd.isSmoker === "no" ? "Ne" : "-"} />
          </Section>

          <Section title="Anamnéza">
            <Field label="Obecná" value={fd.generalAnamnesis} className="leading-tight" />
            <Field label="Alergie" value={fd.allergies} className="leading-tight" />
            <Field label="Medikace" value={fd.permanentMedication} className="leading-tight" />
            <Field label="Stomatologická" value={fd.stomatologicalAnamnesis} className="leading-tight" />
          </Section>

          <Section title="Vyšetření">
            <Field label="Hygiena" value={fd.hygiene} />
            <Field label="Dásně" value={fd.gingiva} />
            <Field label="Zubní kámen" value={fd.tartar} />
            <Field label="Pomůcky" value={fd.tools} />
            <Field label="Kaz" value={fd.caries} />
            <Field label="Sliznice" value={fd.mucosa} />
            <Field label="Jazyk" value={fd.tongue} />
            <Field label="Uzdičky" value={fd.frenulum} />
            <Field label="Okluze" value={fd.occlusion} />
            <Field label="Ortodoncie" value={fd.orthodonticAnomaly} />
          </Section>

          <Section title="PBI">
            <Field label="Datum" value={fd.pbiDate} />
            <Field label="Výsledek" value={fd.pbiResult} />
            <Field label="Pomůcky" value={fd.pbiTools} />
          </Section>

          <Section title="CPITN">
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
              <Field label="HR" value={fd.cpitnUpperRight} />
              <Field label="HL" value={fd.cpitnUpperLeft} />
              <Field label="DL" value={fd.cpitnLowerLeft} />
              <Field label="DR" value={fd.cpitnLowerRight} />
            </div>
          </Section>
        </div>

        {/* CENTER COLUMN - Dental Chart + Main Info */}
        <div className="space-y-1.5 overflow-y-auto pr-1">
          {/* Dental Chart - LARGEST ELEMENT */}
          <DentalChart 
            teeth={fd.dentalCross} 
            notes={fd.dentalCrossNotes}
          />

          {/* Treatment Record */}
          <Section title="Záznam o ošetření">
            <div className="whitespace-pre-wrap text-xs leading-snug bg-gray-50 p-2 rounded">
              {fd.treatmentRecord || "-"}
            </div>
          </Section>

          {/* Examination Summary with COPY */}
          <Section title="Přehled o ošetření" copyText={fd.examinationSummary || ""}>
            <div className="whitespace-pre-wrap text-xs leading-snug bg-blue-50 p-2 rounded border border-blue-200">
              {fd.examinationSummary || "-"}
            </div>
          </Section>
        </div>

        {/* RIGHT COLUMN - Notes & Transcript */}
        <div className="space-y-1.5 overflow-y-auto pr-1">
          <Section title="Poznámky uživatele">
            <div className="whitespace-pre-wrap text-xs leading-snug bg-gray-50 p-2 rounded min-h-[60px]">
              {fd.userNotes || "-"}
            </div>
          </Section>

          <Section title="Poznámky k zubnímu kříži">
            <div className="whitespace-pre-wrap text-xs leading-snug bg-gray-50 p-2 rounded min-h-[60px]">
              {fd.dentalCrossNotes || "-"}
            </div>
          </Section>

          {/* Full Transcript with COPY */}
          <Section title="Celý přepis" copyText={fd.fullTranscript || ""}>
            <div className="whitespace-pre-wrap text-[11px] leading-tight bg-gray-50 p-2 rounded max-h-[400px] overflow-y-auto font-mono">
              {fd.fullTranscript || "-"}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
