import { NextResponse } from "next/server";
import { situationEngine } from "../../../lib/ai/situation-engine";
import { getRecommendedSchemes } from "../../../services/schemeService";
import { UserProfile, ScoredScheme } from "../../../types";

/**
 * WhatsApp Webhook via Twilio
 * 
 * This route handles incoming WhatsApp messages from Twilio and responds
 * using the same Sahayak AI engine as the web chat.
 * 
 * Setup:
 * 1. Get a Twilio account → enable WhatsApp Sandbox
 * 2. Set webhook URL in Twilio to: https://your-domain.com/api/whatsapp
 * 3. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN to env vars
 * 
 * Twilio sends POST with form-urlencoded body containing:
 * - Body: message text
 * - From: sender's WhatsApp number (whatsapp:+91...)
 * - To: Twilio number
 * - NumMedia: number of media attachments
 * - MediaUrl0: URL of first attachment (if any)
 */

export const maxDuration = 30;

// ─── In-memory session store for multi-turn conversations ───
// In production, replace with Redis or Firestore
interface Session {
  messages: { role: "user" | "assistant"; content: string }[];
  lastActive: number;
}

const sessions = new Map<string, Session>();
const SESSION_TTL = 30 * 60 * 1000; // 30 minutes

const WELCOME_MSG = "Namaste! 🙏 I'm Sahayak AI, your personal guide to government welfare schemes in India.\n\nTell me a little about yourself — your age, occupation, and state — and I'll find the best schemes for you.";

function getSession(phoneNumber: string): Session {
  const existing = sessions.get(phoneNumber);
  if (existing && Date.now() - existing.lastActive < SESSION_TTL) {
    existing.lastActive = Date.now();
    return existing;
  }
  // New session or expired - pre-seed with welcome message like the web
  const session: Session = { 
    messages: [{ role: "assistant", content: WELCOME_MSG }], 
    lastActive: Date.now() 
  };
  sessions.set(phoneNumber, session);
  return session;
}

function cleanExpiredSessions() {
  const now = Date.now();
  Array.from(sessions.entries()).forEach(([key, session]) => {
    if (now - session.lastActive > SESSION_TTL) {
      sessions.delete(key);
    }
  });
}

// Clean up every 5 minutes
if (typeof globalThis !== "undefined") {
  // Only set up in Node.js runtime
  setInterval(cleanExpiredSessions, 5 * 60 * 1000);
}

// ─── Detect language from message text ───
function detectLanguage(text: string): { language: string; languageCode: string } {
  // Simple script-based detection for common Indian languages
  if (/[\u0900-\u097F]/.test(text)) return { language: "Hindi", languageCode: "hi-IN" };
  if (/[\u0980-\u09FF]/.test(text)) return { language: "Bengali", languageCode: "bn-IN" };
  if (/[\u0A80-\u0AFF]/.test(text)) return { language: "Gujarati", languageCode: "gu-IN" };
  if (/[\u0B00-\u0B7F]/.test(text)) return { language: "Odia", languageCode: "or-IN" };
  if (/[\u0B80-\u0BFF]/.test(text)) return { language: "Tamil", languageCode: "ta-IN" };
  if (/[\u0C00-\u0C7F]/.test(text)) return { language: "Telugu", languageCode: "te-IN" };
  if (/[\u0C80-\u0CFF]/.test(text)) return { language: "Kannada", languageCode: "kn-IN" };
  if (/[\u0D00-\u0D7F]/.test(text)) return { language: "Malayalam", languageCode: "ml-IN" };
  if (/[\u0A00-\u0A7F]/.test(text)) return { language: "Punjabi", languageCode: "pa-IN" };
  if (/[\u0600-\u06FF]/.test(text)) return { language: "Urdu", languageCode: "ur-IN" };
  if (/[\u0D80-\u0DFF]/.test(text)) return { language: "Sinhala", languageCode: "si-LK" };
  return { language: "English", languageCode: "en-IN" };
}

function formatMarkdownForWhatsApp(text: string): string {
  if (!text) return text;
  return text
    // Remove markdown headers
    .replace(/^###?\s+/gm, '')
    // Replace **bold** with *bold* (WhatsApp uses single asterisk)
    .replace(/\*\*(.*?)\*\*/g, '*$1*')
    // Replace markdown links [text](url) with text - url
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 - $2')
    // Convert generic bullet points to uniform dot
    .replace(/^\* /gm, '• ')
    .replace(/^- /gm, '• ');
}

// ─── Format scheme results for WhatsApp (plain text, no markdown) ───
function formatSchemesForWhatsApp(
  schemes: ScoredScheme[],
  totalBenefit: number
): string {
  if (!schemes || schemes.length === 0) return "";

  let msg = "\n\n📋 *Matching Schemes:*\n";
  schemes.slice(0, 5).forEach((s, i) => {
    msg += `\n${i + 1}. *${s.name}*\n`;
    msg += `   💰 ${s.benefits}\n`;
    msg += `   📊 Match: ${Math.round(s.score * 100)}%\n`;
  });

  if (totalBenefit > 0) {
    const formatted = totalBenefit >= 100000
      ? `₹${(totalBenefit / 100000).toFixed(1)}L`
      : `₹${totalBenefit.toLocaleString("en-IN")}`;
    msg += `\n💵 *Total estimated benefit: ${formatted}/year*`;
  }

  if (schemes.length > 5) {
    msg += `\n\n...and ${schemes.length - 5} more schemes. Visit our website for full details!`;
  }

  return msg;
}

// ─── Send reply via Twilio REST API ───
async function sendWhatsAppReply(to: string, body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886"; // Sandbox default

  if (!accountSid || !authToken) {
    console.error("Twilio credentials not configured");
    return;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  // Twilio has a 1600 char limit for WhatsApp
  // Split long messages if needed
  const chunks = [];
  let remaining = body;
  while (remaining.length > 0) {
    if (remaining.length <= 1500) {
      chunks.push(remaining);
      break;
    }
    // Find a good split point
    let splitAt = remaining.lastIndexOf("\n", 1500);
    if (splitAt < 500) splitAt = remaining.lastIndexOf(". ", 1500);
    if (splitAt < 500) splitAt = 1500;
    chunks.push(remaining.substring(0, splitAt));
    remaining = remaining.substring(splitAt).trim();
  }

  for (const chunk of chunks) {
    const params = new URLSearchParams({
      To: to,
      From: fromNumber,
      Body: chunk,
    });

    await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
  }
}

// ─── Webhook handler ───
export async function POST(request: Request) {
  try {
    // Twilio sends form-urlencoded data
    const formData = await request.formData();
    const body = formData.get("Body") as string || "";
    const from = formData.get("From") as string || "";
    const mediaUrl = formData.get("MediaUrl0") as string | null;

    if (!body.trim() && !mediaUrl) {
      // Return TwiML empty response
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    console.log(`[WhatsApp] Message from ${from}: ${body.substring(0, 100)}`);

    // Handle reset command or Twilio Sandbox join message
    const normalizedBody = body.trim().toLowerCase();
    if (normalizedBody === "reset" || normalizedBody === "restart" || normalizedBody.startsWith("join ")) {
      sessions.delete(from);
      await sendWhatsAppReply(from,
        "🙏 Namaste! I'm *Sahayak AI*.\n\nI help you find government welfare schemes you're eligible for.\n\nTell me about yourself — your *age*, *occupation*, *income*, and *state* — and I'll find the best schemes for you!\n\nYou can message me in Hindi, Bengali, Tamil, Telugu, or any Indian language. 🇮🇳"
      );
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    // Get or create session
    const session = getSession(from);

    // Detect language from user's message
    const { language, languageCode } = detectLanguage(body);

    // Add user message to session
    session.messages.push({ role: "user", content: body });

    // Keep only last 20 messages to prevent context overflow
    if (session.messages.length > 20) {
      session.messages = session.messages.slice(-20);
    }

    // Call the same AI engine as the web chat
    const { reply, isComplete, profile } = await situationEngine(
      session.messages,
      language,
      mediaUrl || undefined,
      languageCode
    );

    // Add AI reply to session
    session.messages.push({ role: "assistant", content: reply });

    // Format Markdown into WhatsApp Markup
    let fullReply = formatMarkdownForWhatsApp(reply);

    // If profile is complete, add scheme recommendations
    if (isComplete && profile) {
      const fullProfile: UserProfile = {
        age: profile.age ?? 25,
        gender: (profile.gender as "male" | "female") ?? "male",
        occupation: profile.occupation ?? "any",
        income: profile.income ?? 0,
        category: profile.category ?? "All",
        state: profile.state ?? "All",
        maritalStatus: (profile.maritalStatus as UserProfile["maritalStatus"]) ?? "any",
        landOwnership: profile.landOwnership ?? false,
      };

      const matchResult = getRecommendedSchemes(fullProfile);
      fullReply += formatSchemesForWhatsApp(matchResult.schemes, matchResult.totalEstimatedBenefit);
    }

    // Send reply via Twilio
    await sendWhatsAppReply(from, fullReply);

    // Return empty TwiML (we already sent the reply via REST API)
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { "Content-Type": "text/xml" } }
    );

  } catch (error) {
    console.error("[WhatsApp] Error:", error);

    // Try to send error message to user
    try {
      const formData = await request.clone().formData();
      const from = formData.get("From") as string;
      if (from) {
        await sendWhatsAppReply(from, "Sorry, I encountered an error. Please try again or type 'reset' to start over.");
      }
    } catch { /* ignore */ }

    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { "Content-Type": "text/xml" } }
    );
  }
}

// ─── Twilio webhook validation (GET for health check) ───
export async function GET() {
  return NextResponse.json({
    status: "active",
    service: "Sahayak AI WhatsApp Bot",
    description: "Send a WhatsApp message to interact with Sahayak AI",
    commands: {
      "reset": "Start a new conversation",
      "Any message": "Chat naturally — tell me your age, occupation, state, and income"
    },
  });
}
