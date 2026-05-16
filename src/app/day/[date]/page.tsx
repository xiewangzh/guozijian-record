import { cookies } from "next/headers";
import { createServerClientInstance } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import DayContent from "@/components/DayContent";

interface DayPageProps {
  params: Promise<{ date: string }>;
}

export default async function DayPage({ params }: DayPageProps) {
  const { date } = await params;
  const cookieStore = await cookies();
  const userName = cookieStore.get("gzj_session")?.value || "";
  const supabase = await createServerClientInstance();

  const { data: userData } = await supabase
    .from("allowed_users")
    .select("role")
    .eq("name", userName)
    .single();

  const isAdmin = userData?.role === "admin";

  // Fetch images for this date
  const { data: images } = await supabase
    .from("images")
    .select("*")
    .eq("taken_date", date)
    .order("created_at", { ascending: false });

  // Parse date for display
  const [y, m, d] = date.split("-");
  const displayDate = `${y}年${parseInt(m)}月${parseInt(d)}日`;

  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar userName={userName} isAdmin={isAdmin} />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <a href="/" className="text-sm text-amber-600 hover:text-amber-800">← 返回日历</a>
            <h1 className="text-2xl font-bold text-amber-900 mt-1">{displayDate}</h1>
          </div>
        </div>

        <DayContent
          date={date}
          images={images || []}
          isAdmin={isAdmin}
        />
      </main>
    </div>
  );
}
