import { Resend } from "resend";

const resend = new Resend(Bun.env.RESEND_API_KEY || "re_placeholder");

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  await resend.emails.send({
    from: "Uber <mails@tanav.me>",
    to,
    subject,
    html,
  });
}

// reset email
// complete trip email
