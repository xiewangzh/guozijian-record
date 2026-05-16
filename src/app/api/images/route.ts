import { NextRequest, NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const supabase = await createServerClientInstance();
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date");
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  let query = supabase.from("images").select("*").order("created_at", { ascending: false });

  if (date) {
    query = query.eq("taken_date", date);
  } else if (year && month) {
    const start = `${year}-${month.padStart(2, "0")}-01`;
    const end = `${year}-${month.padStart(2, "0")}-31`;
    query = query.gte("taken_date", start).lte("taken_date", end);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ images: data });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const supabase = await createServerClientInstance();
  const body = await request.json();
  const { file_path, file_name, taken_date, description } = body;

  if (!file_path || !file_name || !taken_date) {
    return NextResponse.json({ error: "缺少必要信息" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("images")
    .insert({
      file_path,
      file_name,
      taken_date,
      description: description || "",
      uploaded_by: user,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ image: data }, { status: 201 });
}
