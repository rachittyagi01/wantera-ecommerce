import { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router"
import { useVerifyEmailMutation } from "@/services/authApi"

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const [verifyEmail] = useVerifyEmailMutation()
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function runVerification() {
      if (!token) {
        setStatus("error")
        setMessage("No verification token found in the link.")
        return
      }
      try {
        const result = await verifyEmail(token).unwrap()
        setStatus("success")
        setMessage(result.message)
      } catch (err) {
        setStatus("error")
        const errMessage =
          err && typeof err === "object" && "data" in err
            ? (err.data as { message?: string })?.message
            : "Verification failed"
        setMessage(errMessage || "Verification failed")
      }
    }
    runVerification()
  }, [token])

  return (
    <div className="px-6 py-20 max-w-md mx-auto text-center">
      {status === "verifying" && (
        <p className="text-text-muted">Verifying your email...</p>
      )}

      {status === "success" && (
        <>
          <div className="text-success text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-display font-bold mb-2">Email Verified!</h1>
          <p className="text-text-muted mb-8">{message}</p>
          <Link to="/login" className="text-primary hover:underline font-medium">
            Continue to Login
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <div className="text-error text-5xl mb-4">✕</div>
          <h1 className="text-2xl font-display font-bold mb-2">Verification Failed</h1>
          <p className="text-text-muted mb-8">{message}</p>
          <Link to="/login" className="text-primary hover:underline font-medium">
            Back to Login
          </Link>
        </>
      )}
    </div>
  )
}