import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  // In production, send email or store in DB
  console.log("Contact form submission:", { name, email, subject, message });

  return NextResponse.json({ success: true });
}
