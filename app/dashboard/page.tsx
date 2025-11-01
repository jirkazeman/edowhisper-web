"use client";

import { useState, useEffect } from "react";
import { Users, Activity } from "lucide-react";
import { recordsAPI } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRecords: 0,
    loading: true,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const records = await recordsAPI.getAll();

        setStats({
          totalRecords: records.length,
          loading: false,
        });
      } catch (error) {
        console.error("Failed to load stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    }

    loadStats();
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Přehled</h1>
          <p className="text-gray-500">Vítejte zpět v EDO Whisper</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Celkem záznamů</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.loading ? "..." : stats.totalRecords}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Activity className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Poslední aktivita</p>
                <p className="text-2xl font-bold text-gray-900">Dnes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rychlé akce</h2>
          <div className="grid grid-cols-1 gap-4">
            <a
              href="/dashboard/records"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition cursor-pointer"
            >
              <h3 className="font-medium text-gray-900 mb-1">Spravovat záznamy</h3>
              <p className="text-sm text-gray-500">
                Prohlížet a upravovat záznamy pacientů
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
