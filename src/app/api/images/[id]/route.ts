import { NextRequest, NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const supabase = await createServerClientInstance();
  const { id } = await params;
  const body = await request.json();
  const { taken_date, description } = body;

  const updates: Record<string, unknown> = {};
  if (taken_date) updates.taken_date = taken_date;
  if (description !== undefined) updates.description = description;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "没有要更新的内容" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("images")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ image: data });
}

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

  // Get file_path to delete from storage
  const { data: image } = await supabase.from("images").select("file_path").eq("id", id).single();

  if (image) {
    const pathMatch = image.file_path.match(/images\/(.+)/);
    if (pathMatch) {
      await supabase.storage.from("images").remove([pathMatch[1]]);
    }
  }

  const { error } = await supabase.from("images").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
