import { GoogleGenerativeAI } from '@google/generative-ai'

import { env } from '@/lib/env'

const client = new GoogleGenerativeAI(env.GEMINI_API_KEY)

export async function ask(prompt: string): Promise<string> {
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    systemInstruction:
      'You are Arc, a smart movie companion. Be concise, sharp, and never generic. Max 2 sentences unless asked for more.',
  })

  const result = await model.generateContent(prompt)

  return result.response.text().trim()
}
