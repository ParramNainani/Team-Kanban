import { NextResponse } from "next/server";

/**
 * TTS Proxy API Route
 * 
 * Proxies text-to-speech requests to Google Translate's TTS engine.
 * This bypasses CORS restrictions that prevent the client from directly
 * accessing Google Translate's audio endpoint.
 * 
 * Usage: GET /api/tts?text=Hello&lang=bn
 * 
 * Vercel-compatible: Uses Node.js runtime with appropriate timeout.
 */

// Vercel serverless function config
export const runtime = "nodejs";
export const maxDuration = 10; // seconds (Vercel hobby plan limit)

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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://translate.google.com/",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error("Google TTS error:", response.status, response.statusText);
      return NextResponse.json({ error: "TTS service unavailable" }, { status: 502 });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, s-maxage=86400, max-age=86400", // Vercel CDN + browser cache 24h
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "TTS request timed out" }, { status: 504 });
    }
    console.error("TTS proxy error:", error);
    return NextResponse.json({ error: "TTS proxy failed" }, { status: 500 });
  }
}
