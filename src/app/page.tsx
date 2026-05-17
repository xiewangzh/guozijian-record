export const runtime = "edge";
import { cookies } from "next/headers";
import { createServerClientInstance } from "@/lib/supabase/server";
import CalendarView from "@/components/CalendarView";
import UploadWidget from "@/components/UploadWidget";
import Navbar from "@/components/Navbar";

export default async function HomePage() {
  const cookieStore = await cookies();
  const userName = cookieStore.get("gzj_session")?.value || "";
  const supabase = await createServerClientInstance();

  const { data: userData } = await supabase
    .from("allowed_users")
    .select("role")
    .eq("name", userName)
    .single();

  const isAdmin = userData?.role === "admin";

  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar userName={userName} isAdmin={isAdmin} />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <UploadWidget />
        <CalendarView />
      </main>
    </div>
  );
}
