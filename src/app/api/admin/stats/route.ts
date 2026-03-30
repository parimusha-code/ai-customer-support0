import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    // 1. Total Documents
    const { count: docCount, error: docError } = await supabase
      .from("documents")
      .select("*", { count: 'exact', head: true });

    if (docError) throw docError;

    // 2. Total Sessions
    const { count: sessionCount, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("*", { count: 'exact', head: true });

    if (sessionError) throw sessionError;

    // 3. Recently Uploaded
    const { data: recentDocs, error: recentError } = await supabase
      .from("documents")
      .select("name, topic, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentError) throw recentError;

    return NextResponse.json({
      totalDocuments: docCount || 0,
      totalSessions: sessionCount || 0,
      activeUsers: 1, // Placeholder as no auth
      recentDocuments: recentDocs
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
