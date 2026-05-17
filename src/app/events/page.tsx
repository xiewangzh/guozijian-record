export const runtime = "edge";
import { cookies } from "next/headers";
import { createServerClientInstance } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import EventList from "@/components/EventList";

export default async function EventsPage() {
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
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-amber-900 mb-6">大事件记录</h1>
        <EventList isAdmin={isAdmin} />
      </main>
    </div>
  );
}
