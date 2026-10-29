import { NextResponse } from "next/server";
import { sendFormEmail } from "@/app/lib/mailer";

export async function POST(req) {
  try {
    const { name, email, brokerage, plan, notes } = await req.json();
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    await sendFormEmail({
      subject: `New waitlist signup: ${name}${plan ? ` — ${plan}` : ""}`,
      heading: "New waitlist signup",
      replyName: name,
      replyEmail: email,
      fields: [
        ["Name", name],
        ["Email", email],
        ["Business / Brokerage", brokerage],
        ["Interested In", plan],
        ["Notes", notes],
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "Sorry, your message couldn't be sent. Please email colt@elevateyourmarketing.org directly." },
      { status: 500 }
    );
  }
}
