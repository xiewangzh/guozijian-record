"use client";

import { useRouter } from "next/navigation";

interface NavbarProps {
  userName: string;
  isAdmin: boolean;
}

export default function Navbar({ userName, isAdmin }: NavbarProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <nav className="bg-amber-900 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-wide">国子监</h1>
          <span className="text-amber-300 text-xs hidden sm:inline">高中生活记录</span>
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
