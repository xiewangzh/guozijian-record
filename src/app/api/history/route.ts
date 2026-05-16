import { NextRequest, NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const supabase = await createServerClientInstance();
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "请指定日期" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("history_entries")
    .select("*")
    .eq("date", date)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ entries: data });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const supabase = await createServerClientInstance();
  const body = await request.json();
  const { date, content } = body;

  if (!date || !content?.trim()) {
    return NextResponse.json({ error: "缺少日期或内容" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("history_entries")
    .insert({
      date,
      author: user,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ entry: data }, { status: 201 });
}
