import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getEmbedding } from "@/lib/embeddings";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000", // Required by some OpenRouter models
    "X-Title": "AI Customer Support",
  }
});

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    // 0. Save user message if sessionId exists
    if (sessionId) {
      console.log(`Saving user message to session ${sessionId}...`);
      const { error: msgError } = await supabaseAdmin.from("chat_messages").insert({
        session_id: sessionId,
        role: "user",
        content: message
      });
      if (msgError) {
        console.error("Error saving user message:", msgError);
        // We don't throw here to allow the chat to continue even if history fails, 
        // but it's good to know it happened.
      }
    }

    // 1. Generate embedding for the user message
    console.log("Generating query embedding...");
    const queryEmbedding = await getEmbedding(message);

    // 2. Search for relevant document sections in Supabase
    console.log("Searching for relevant context using match_document_sections...");
    const { data: sections, error: searchError } = await supabaseAdmin.rpc(
      "match_document_sections",
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.1, // Adjusted to a very low but safe threshold
        match_count: 10,
      }
    );

    if (searchError) {
      console.error("Supabase Search Error:", searchError);
      throw new Error(`Knowledge base search failed: ${searchError.message}`);
    }

    console.log(`Knowledge Base Response: Found ${sections?.length || 0} relative segments.`);
    if (sections && sections.length > 0) {
      console.log("Most relative segment score:", sections[0].similarity);
    }
    const context = sections?.map((s: any) => s.content).join("\n\n") || "No relevant context found.";

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not set");
    }

    // 3. Generate completion with OpenRouter, restricted to context
    console.log("Requesting completion from OpenRouter using meta-llama/llama-3-8b-instruct:free...");
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
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
      stream: false,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("No response choices returned from AI service.");
    }

    const reply = response.choices[0].message.content;
    
    if (!reply) {
      console.warn("AI returned empty reply content.");
    }
    
    console.log("Bot reply generated successfully.");

    // 4. Save bot message if sessionId exists
    if (sessionId) {
      console.log(`Saving bot message to session ${sessionId}...`);
      await supabaseAdmin.from("chat_messages").insert({
        session_id: sessionId,
        role: "bot",
        content: reply
      });
    }

    return NextResponse.json({
      reply: reply,
      sections: sections,
    });
  } catch (error: any) {
    console.error("CRITICAL CHAT ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error during chat." },
      { status: 500 }
    );
  }
}
