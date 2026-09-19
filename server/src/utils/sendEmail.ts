import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await resend.emails.send({
      from: "WANTERA <onboarding@resend.dev>", // Resend's shared sending domain — works without domain verification
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error("Email send error:", error)
  }
}