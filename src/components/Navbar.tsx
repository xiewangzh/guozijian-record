"use client";

import { useRouter, usePathname } from "next/navigation";

interface NavbarProps {
  userName: string;
  isAdmin: boolean;
}

export default function Navbar({ userName, isAdmin }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <nav className="bg-amber-900 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-bold tracking-wide">国子监</h1>

          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push("/")}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                pathname === "/" ? "bg-amber-700 text-white" : "text-amber-300 hover:text-white"
              }`}
            >
              日历
            </button>
            <button
              onClick={() => router.push("/events")}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                pathname.startsWith("/events") ? "bg-amber-700 text-white" : "text-amber-300 hover:text-white"
              }`}
            >
              大事件
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-amber-200">
            {userName}
            {isAdmin && (
              <span className="ml-1.5 text-xs bg-amber-600 px-1.5 py-0.5 rounded">创建者</span>
            )}
          </span>
          <button
            onClick={handleLogout}
            className="text-amber-300 hover:text-white transition-colors text-xs"
          >
            退出
          </button>
        </div>
      </div>
    </nav>
  );
}
