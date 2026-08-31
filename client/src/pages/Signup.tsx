import { useState } from "react"
import { useNavigate, Link } from "react-router"
import { useSignupMutation } from "@/services/authApi"
import { useAppDispatch } from "@/store/hooks"
import { setCredentials } from "@/features/auth/authSlice"

export default function Signup() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [signup, { isLoading, error }] = useSignupMutation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const result = await signup({ name, email, password }).unwrap()
      dispatch(setCredentials({ user: result.user, accessToken: result.accessToken }))
      navigate("/")
    } catch {
      // handled via `error`
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-2xl font-display font-bold mb-2">Let's Get You Started.</h1>
      <p className="text-text-muted mb-8">Create your WANTERA account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-border rounded-default px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-border rounded-default px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border rounded-default px-3 py-2"
          />
        </div>

        {error && (
          <p className="text-error text-sm">
            {"data" in error && (error.data as { message?: string })?.message
              ? (error.data as { message: string }).message
              : "Signup failed. Please try again."}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-3 rounded-default font-medium"
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-sm text-text-muted mt-6 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-primary hover:underline">Sign In</Link>
      </p>
    </div>
  )
}