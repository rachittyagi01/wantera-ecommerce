import { transporter } from "../config/mailer"

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: `"WANTERA" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    })
  } catch (error) {
    // Log but don't throw — a failed email shouldn't crash the request that triggered it
    // (e.g., signup should still succeed even if the welcome email fails to send)
    console.error("Email send error:", error)
  }
}