import { cookies } from "next/headers";
import { createServerClientInstance } from "./supabase/server";

export async function getCurrentUser(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("gzj_session");
  if (!session) return null;
  return session.value;
}

export async function isAdmin(): Promise<boolean> {
  const name = await getCurrentUser();
  if (!name) return false;
  const supabase = await createServerClientInstance();
  const { data } = await supabase
    .from("allowed_users")
    .select("role")
    .eq("name", name)
    .single();
  return data?.role === "admin";
}
