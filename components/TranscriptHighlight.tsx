"use client";

import React, { useMemo } from 'react';
import { 
  matchTranscriptToExtractedData, 
  groupWordsIntoSegments, 
  calculateTranscriptUsage,
  TextSegment 
} from '@/lib/transcriptDiff';
import { RecordFormData } from '@/lib/types';

interface TranscriptHighlightProps {
  transcript: string;
  extractedData: RecordFormData;
  showStats?: boolean;
}

export default function TranscriptHighlight({ 
  transcript, 
  extractedData,
  showStats = true 
}: TranscriptHighlightProps) {
  
  // Vypočítat shody mezi přepisem a extrahovanými daty
  const { segments, usage } = useMemo(() => {
    const matches = matchTranscriptToExtractedData(transcript, extractedData);
    const segments = groupWordsIntoSegments(matches);
    const usage = calculateTranscriptUsage(matches);
    
    return { segments, usage };
  }, [transcript, extractedData]);

  // Barva podle typu segmentu
  const getSegmentStyle = (segment: TextSegment) => {
    if (segment.used) {
      return 'bg-transparent'; // Použité slovo - normální
    } else {
      return 'bg-yellow-200 text-yellow-900'; // Nepoužité - žluté
    }
  };

  return (
    <div className="space-y-3">
      {/* Statistiky */}
      {showStats && (
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-transparent border-2 border-gray-300 rounded"></div>
            <span className="text-sm text-gray-600">
              Použito: {usage.used} slov ({usage.percentage.toFixed(1)}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-200 rounded"></div>
            <span className="text-sm text-yellow-700">
              Nevyužito: {usage.unused} slov
            </span>
          </div>
        </div>
      )}

      {/* Highlighted přepis */}
      <div className="p-4 bg-white border border-gray-300 rounded-lg">
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {segments.map((segment, index) => (
            <span
              key={index}
              className={`${getSegmentStyle(segment)} px-0.5 rounded`}
              title={segment.used && segment.fieldName ? `Použito v: ${segment.fieldName}` : 'LLM toto slovo nepoužilo'}
            >
              {segment.text}
            </span>
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div className="text-xs text-gray-500">
        💡 <strong>Žlutě</strong> = slova, která LLM nepoužilo při extrakci dat
      </div>
    </div>
  );
}

