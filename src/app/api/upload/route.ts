import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { chunkText, getEmbedding } from "@/lib/embeddings";
import pdf from "pdf-parse";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const topic = formData.get("topic") as string || "General";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text = "";
    if (file.type === "application/pdf") {
      console.log("Parsing PDF document...");
      try {
        // More robust import for next.js
        const pdfParse = (await import("pdf-parse")).default || (await import("pdf-parse"));
        const data = await pdfParse(buffer);
        text = data.text;
      } catch (pdfErr: any) {
        console.error("PDF Parsing Error detail:", pdfErr);
        throw new Error(`PDF Parsing failed: ${pdfErr.message || "Ensure the file is a valid PDF."}`);
      }
    } else {
      text = buffer.toString("utf-8");
    }

    if (!text) {
      console.error("Text extraction failed or returned empty content.");
      return NextResponse.json({ error: "Failed to extract text from the file." }, { status: 400 });
    }

    console.log(`Document text extracted successfully (${text.length} characters).`);

    // 1. Create document record with topic
    console.log("Inserting document metadata into Supabase...");
    const { data: doc, error: docError } = await supabaseAdmin
      .from("documents")
      .insert({ 
        name: file.name,
        topic: topic 
      })
      .select()
      .single();

    if (docError) {
      console.error("Supabase Document Insertion Error:", docError);
      throw new Error(`Failed to create document record: ${docError.message}`);
    }

    console.log(`Document record created with ID: ${doc.id}`);

    // 2. Chunk text and generate embeddings
    console.log("Chunking text...");
    const chunks = chunkText(text);
    console.log(`Text split into ${chunks.length} chunks.`);

    const sections = await Promise.all(
      chunks.map(async (chunk, index) => {
        try {
          const embedding = await getEmbedding(chunk);
          if (!embedding) {
            throw new Error("Failed to generate embedding for a text chunk.");
          }
          if (embedding.length !== 1536) {
            throw new Error(`Invalid embedding dimension: ${embedding.length} (expected 1536)`);
          }
          return {
            content: chunk,
            embedding: embedding,
            document_id: doc.id
          };
        } catch (err: any) {
          console.error(`Error generating embedding for chunk ${index}:`, err);
          throw err;
        }
      })
    );

    // 3. Store sections
    console.log(`Inserting ${sections.length} sections into Supabase...`);
    const { error: sectionError } = await supabaseAdmin
      .from("document_sections")
      .insert(sections);

    if (sectionError) {
      console.error("Supabase Section Insertion Error:", sectionError);
      throw new Error(`Failed to store document sections: ${sectionError.message}`);
    }

    console.log("Upload and processing complete!");
    return NextResponse.json({ success: true, documentId: doc.id });
  } catch (error: any) {
    console.error("CRITICAL UPLOAD ERROR:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during upload." },
      { status: 500 }
    );
  }
}
