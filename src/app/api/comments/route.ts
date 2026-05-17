export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const supabase = await createServerClientInstance();
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date");
  const imageId = searchParams.get("imageId");

  let query = supabase.from("comments").select("*").order("created_at", { ascending: true });

  if (imageId) {
    query = query.eq("image_id", imageId);
  } else if (date) {
    query = query.eq("date", date).is("image_id", null);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ comments: data });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const supabase = await createServerClientInstance();
  const body = await request.json();
  const { date, image_id, content } = body;

  if (!date || !content) {
    return NextResponse.json({ error: "缺少必要信息" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      date,
      image_id: image_id || null,
      author: user,
      content,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ comment: data }, { status: 201 });
}
