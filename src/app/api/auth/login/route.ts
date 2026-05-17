export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { name } = await request.json();
  const trimmed = name?.trim();

  if (!trimmed) {
    return NextResponse.json({ error: "请输入姓名" }, { status: 400 });
  }

  const supabase = await createServerClientInstance();

  const { data: user, error } = await supabase
    .from("allowed_users")
    .select("name, role")
    .ilike("name", trimmed)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "你的名字不在访问名单中" }, { status: 403 });
  }

  const response = NextResponse.json({ success: true, name: user.name, role: user.role });
  response.cookies.set("gzj_session", user.name, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
