import connectDb from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { message, role } = await req.json();
    const prompt = `You are a smart delivery assistant chatbot generating quick reply suggestions.

Context:
- Role: "${role}" (either "user" or "delivery_boy")
- Last message: "${message}"

Task:
Generate exactly 3 short WhatsApp-style reply suggestions based on the last message.

Rules:
- Replies must be relevant to delivery context (location, timing, status, help).
- Each reply must be under 10 words.
- Use natural, human-like tone.
- Use at most one emoji per reply.
- Avoid generic replies like "Okay", "Thanks".
- Replies should feel actionable or informative.
- Do NOT repeat meaning across replies.

Output format:
- Only return 3 replies
- Comma-separated
- No numbering
- No extra text
- No explanations

Examples tone:
"Where are you now? 📍", "I’ll reach in 5 minutes", "Please call on arrival"

Generate replies now.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    );

    const data = await response.json();
    const replayText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const suggestions = replayText.split(",").map((s: string) => s.trim());
    return NextResponse.json({ suggestions }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Gemini error", error },
      { status: 200 },
    );
  }
}
