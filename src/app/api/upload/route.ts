import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { chunkText, getEmbedding } from "@/lib/embeddings";
import pdf from "pdf-parse";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text = "";
    if (file.type === "application/pdf") {
      const data = await pdf(buffer);
      text = data.text;
    } else {
      text = buffer.toString("utf-8");
    }

    if (!text) {
      return NextResponse.json({ error: "Failed to extract text" }, { status: 400 });
    }

    // 1. Create document record
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .insert({ name: file.name })
      .select()
      .single();

    if (docError) throw docError;

    // 2. Chunk text and generate embeddings
    const chunks = chunkText(text);
    const sections = await Promise.all(
      chunks.map(async (chunk) => {
        const embedding = await getEmbedding(chunk);
        return {
          document_id: doc.id,
          content: chunk,
          embedding: embedding,
        };
      })
    );

    // 3. Store sections (in batches if necessary, but here simple)
    const { error: sectionError } = await supabase
      .from("document_sections")
      .insert(sections);

    if (sectionError) throw sectionError;

    return NextResponse.json({ success: true, documentId: doc.id });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
