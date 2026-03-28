import { NextResponse } from "next/server";
import type { Message } from "@/types";

type Body = {
  messages: Message[];
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const last = body.messages?.at(-1);
  if (!last || last.role !== "user") {
    return NextResponse.json(
      { error: "Last message must be from user" },
      { status: 400 }
    );
  }

  const reply: Message = {
    role: "assistant",
    content: `You said: “${last.content.slice(0, 200)}${last.content.length > 200 ? "…" : ""}”. This is a placeholder reply until the situation engine is wired up.`,
  };

  return NextResponse.json({ message: reply });
}
