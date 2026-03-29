import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getEmbedding } from "@/lib/embeddings";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    // 1. Generate embedding for the user message
    const queryEmbedding = await getEmbedding(message);

    // 2. Search for relevant document sections in Supabase
    const { data: sections, error: searchError } = await supabase.rpc(
      "match_document_sections",
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: 5,
      }
    );

    if (searchError) throw searchError;

    const context = sections?.map((s: any) => s.content).join("\n\n") || "No relevant context found.";

    // 3. Generate completion with OpenRouter, restricted to context
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-pro-exp-02-05:free", // Using a free tier model as an example, update if needed
      messages: [
        {
          role: "system",
          content: `You are a helpful and professional AI Customer Support Agent. Your knowledge is strictly limited to the provided document context.

RULES:
1. ONLY answer questions using the information provided in the Context below.
2. If the answer is not contained within the Context, honestly state: "I'm sorry, I don't have information about that in my knowledge base."
3. DO NOT use your general knowledge to answer questions.
4. If the user greets you, respond politely but remind them you can only answer questions about the uploaded documents.
5. Provide citations or quote snippets from the documents when possible.

CONTEXT:
${context}`,
        },
        { role: "user", content: message },
      ],
      stream: false, // Simple non-streamed for now, can upgrade later
    });

    return NextResponse.json({
      reply: response.choices[0].message.content,
      sections: sections,
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
