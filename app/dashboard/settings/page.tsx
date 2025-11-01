"use client";

import { useState } from "react";
import { Settings as SettingsIcon, Type, Save } from "lucide-react";

const fontSizes = [
  { label: "Velmi malé", value: "87.5%" },
  { label: "Malé", value: "100%" },
  { label: "Střední", value: "112.5%" },
  { label: "Velké", value: "125%" },
  { label: "Velmi velké", value: "150%" },
];

export default function SettingsPage() {
  const [fontSize, setFontSize] = useState("100%");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    document.documentElement.style.fontSize = fontSize;
    localStorage.setItem("fontSize", fontSize);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nastavení</h1>
          <p className="text-gray-500">Upravte nastavení aplikace</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Font Size */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <Type className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Velikost písma
                </h2>
                <p className="text-sm text-gray-500">
                  Nastavte velikost textu v aplikaci
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {fontSizes.map((size) => (
                <label
                  key={size.value}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                >
                  <input
                    type="radio"
                    name="fontSize"
                    value={size.value}
                    checked={fontSize === size.value}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {size.label}
                  </span>
                  <span className="text-sm text-gray-500 ml-auto">
                    {size.value}
                  </span>
                </label>
              ))}
            </div>

            <button
              onClick={handleSave}
              className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              <Save size={18} />
              {saved ? "Uloženo!" : "Uložit změny"}
            </button>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gray-50 rounded-lg">
                <SettingsIcon className="text-gray-600" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Informace o účtu
                </h2>
                <p className="text-sm text-gray-500">
                  Základní informace o vašem účtu
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Email</span>
                <span className="text-sm font-medium text-gray-900">
                  demo@edowhisper.cz
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Typ účtu</span>
                <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  Demo
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">Verze aplikace</span>
                <span className="text-sm font-medium text-gray-900">1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
