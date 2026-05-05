import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// List all documents
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("documents")
      .select("id, name, topic, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Fetch Documents Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete a document and its sections
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    console.log(`Deleting document ${id} and its vector sections...`);

    // Note: Due to foreign key constraints with ON DELETE CASCADE (if set up), 
    // delete from documents might handle document_sections. 
    // If not, we delete sections first.
    
    // 1. Delete sections first to be safe
    const { error: sectionError } = await supabaseAdmin
      .from("document_sections")
      .delete()
      .eq("document_id", id);

    if (sectionError) throw sectionError;

    // 2. Delete document record
    const { error: docError } = await supabaseAdmin
      .from("documents")
      .delete()
      .eq("id", id);

    if (docError) throw docError;

    return NextResponse.json({ success: true, message: "Document deleted successfully" });
  } catch (error: any) {
    console.error("Delete Document Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
