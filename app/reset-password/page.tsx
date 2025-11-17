"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, AlertCircle, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Hesla se neshodují");
      return;
    }

    if (password.length < 6) {
      setError("Heslo musí mít alespoň 6 znaků");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => router.push("/"), 3000);
    } catch (err: any) {
      console.error("Reset error:", err);
      setError(err.message || "Změna hesla se nezdařila");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">EDO Whisper</h1>
            <p className="text-gray-500">Nastavení nového hesla</p>
          </div>

          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-green-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Heslo změněno!</h3>
              <p className="text-sm text-gray-600 mb-4">Vaše heslo bylo úspěšně změněno.</p>
              <p className="text-xs text-gray-500">Budete přesměrováni na přihlášení...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-red-900">{error}</p>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Nové heslo
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimálně 6 znaků</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Potvrzení hesla
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock size={18} />
                  {loading ? "Ukládání..." : "Nastavit nové heslo"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
