import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

/**
 * Generates an embedding for a given text using OpenAI (via OpenRouter).
 * Default model: text-embedding-3-small (1536 dimensions)
 */
export async function getEmbedding(text: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await openai.embeddings.create({
        model: 'openai/text-embedding-3-small',
        input: text.replace(/\n/g, ' '),
      });
      return response.data[0].embedding;
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`Embedding failed, retrying (${i + 1}/${retries})...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

/**
 * Chunks text into smaller segments for embedding.
 */
export function chunkText(text: string, maxChars = 1000) {
  const chunks: string[] = [];
  let currentChunk = '';

  const sentences = text.split(/(?<=[.?!])\s+/);

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChars) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += ' ' + sentence;
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}
