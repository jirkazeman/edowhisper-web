"use client";

import { LayoutDashboard, Users, Settings, Brain, LogOut, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";

const navigation = [
  { name: "Přehled", href: "/dashboard", icon: LayoutDashboard },
  { name: "Záznamy", href: "/dashboard/records", icon: Users },
  { name: "Fine-Tuning", href: "/dashboard/fine-tuning", icon: Sparkles },
  { name: "AI Role", href: "/dashboard/ai-roles", icon: Brain },
  { name: "Nastavení", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Protect route - redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Show loading or nothing while checking auth
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Načítání...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 relative`}>
        {/* Toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 z-10 bg-white border border-gray-200 rounded-full p-1 hover:bg-gray-50 transition"
          title={isCollapsed ? "Rozbalit menu" : "Sbalit menu"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className={`text-xl font-bold text-gray-900 whitespace-nowrap ${isCollapsed ? 'hidden' : 'block'}`}>
            EDO Whisper
          </h1>
          {isCollapsed && <span className="text-xl font-bold text-blue-600">E</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon size={20} />
                {!isCollapsed && item.name}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition`}
            title={isCollapsed ? "Odhlásit se" : undefined}
          >
            <LogOut size={20} />
            {!isCollapsed && "Odhlásit se"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
