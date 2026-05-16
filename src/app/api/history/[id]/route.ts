import { NextRequest, NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "仅创建者可删除" }, { status: 403 });

  const supabase = await createServerClientInstance();
  const { id } = await params;

  const { error } = await supabase.from("history_entries").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
