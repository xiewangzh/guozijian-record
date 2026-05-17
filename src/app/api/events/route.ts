export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const supabase = await createServerClientInstance();
  const semesterId = request.nextUrl.searchParams.get("semester_id");

  let query = supabase.from("events").select("*, event_entries(*)").order("created_at", { ascending: false });
  if (semesterId) query = query.eq("semester_id", semesterId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ events: data });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "仅创建者可创建事件" }, { status: 403 });

  const supabase = await createServerClientInstance();
  const body = await request.json();
  const { semester_id, title } = body;

  if (!semester_id || !title?.trim()) {
    return NextResponse.json({ error: "缺少学期或标题" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("events")
    .insert({ semester_id, title: title.trim(), created_by: user })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event: data }, { status: 201 });
}
