import { NextRequest, NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const supabase = await createServerClientInstance();
  const { id: event_id } = await params;
  const body = await request.json();
  const { content } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("event_entries")
    .insert({ event_id, author: user, content: content.trim() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entry: data }, { status: 201 });
}
