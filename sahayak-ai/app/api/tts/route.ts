import { NextResponse } from "next/server";

/**
 * TTS Proxy API Route
 * 
 * Proxies text-to-speech requests to Google Translate's TTS engine.
 * This bypasses CORS restrictions that prevent the client from directly
 * accessing Google Translate's audio endpoint.
 * 
 * Usage: GET /api/tts?text=Hello&lang=bn
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text");
  const lang = searchParams.get("lang") || "en";

  if (!text) {
    return NextResponse.json({ error: "text parameter is required" }, { status: 400 });
  }

  // Limit text length to prevent abuse
  if (text.length > 200) {
    return NextResponse.json({ error: "text too long, max 200 chars" }, { status: 400 });
  }

  try {
    const encoded = encodeURIComponent(text);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=tw-ob`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://translate.google.com/",
      },
    });

    if (!response.ok) {
      console.error("Google TTS error:", response.status, response.statusText);
      return NextResponse.json({ error: "TTS service unavailable" }, { status: 502 });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400", // Cache for 24h
      },
    });
  } catch (error) {
    console.error("TTS proxy error:", error);
    return NextResponse.json({ error: "TTS proxy failed" }, { status: 500 });
  }
}
