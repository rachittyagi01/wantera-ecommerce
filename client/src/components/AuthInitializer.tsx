import { useEffect, useState } from "react"
import { useAppDispatch } from "@/store/hooks"
import { setCredentials, logout } from "@/features/auth/authSlice"
import { useRefreshMutation } from "@/services/authApi"
import { API_BASE_URL } from "@/constants/api"

// Runs once when the app first loads. Tries to silently restore a logged-in
// session using the httpOnly refresh cookie, without requiring the user to log in again.
export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false)
  const dispatch = useAppDispatch()
  const [refresh] = useRefreshMutation()

  useEffect(() => {
    async function tryRestoreSession() {
      try {
        const refreshResult = await refresh().unwrap()

        // We have a fresh access token — now fetch the actual user profile with it
        const meResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${refreshResult.accessToken}` },
        })

        if (!meResponse.ok) throw new Error("Failed to fetch user")

        const meData = await meResponse.json()

        dispatch(
          setCredentials({
            user: meData.user,
            accessToken: refreshResult.accessToken,
          })
        )
      } catch {
        // No valid refresh cookie exists, or it expired — that's fine,
        // just means the user genuinely isn't logged in. Stay logged out.
        dispatch(logout())
      } finally {
        setChecked(true)
      }
    }

    tryRestoreSession()
  }, [])

  // Avoid flashing "logged out" UI for a split second while we're still checking
  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-muted">
        Loading...
      </div>
    )
  }

  return <>{children}</>
}