import { useState } from "react"
import { Link } from "react-router"
import { useGetMeQuery, useUpdateProfileMutation, useChangePasswordMutation } from "@/services/authApi"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { setCredentials } from "@/features/auth/authSlice"

export default function Account() {
  const user = useAppSelector((state) => state.auth.user)
  const accessToken = useAppSelector((state) => state.auth.accessToken)
  const dispatch = useAppDispatch()
  const { data, isLoading } = useGetMeQuery(undefined, { skip: !user })

  const [updateProfile, { isLoading: savingProfile }] = useUpdateProfileMutation()
  const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation()

  const [name, setName] = useState("")
  const [profileMessage, setProfileMessage] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")
  const [passwordError, setPasswordError] = useState("")

  if (!user) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-text-muted mb-4">Please log in to view your account.</p>
        <Link to="/login" className="text-primary hover:underline">Go to Login</Link>
      </div>
    )
  }

  if (isLoading) {
    return <div className="px-6 py-16 text-text-muted">Loading account...</div>
  }

  const currentName = name || data?.user.name || ""

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileMessage("")
    try {
      const result = await updateProfile({ name: currentName }).unwrap()
      setProfileMessage("Profile updated successfully.")

      if (accessToken) {
        dispatch(setCredentials({ user: result.user, accessToken }))
      }
    } catch {
      setProfileMessage("Failed to update profile.")
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordMessage("")
    setPasswordError("")
    try {
      await changePassword({ currentPassword, newPassword }).unwrap()
      setPasswordMessage("Password changed successfully.")
      setCurrentPassword("")
      setNewPassword("")
    } catch (err) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err.data as { message?: string })?.message
          : "Failed to change password."
      setPasswordError(message || "Failed to change password.")
    }
  }

  return (
    <div className="px-6 py-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-display font-bold mb-8">Account Settings</h1>

      <div className="border border-border rounded-card p-6 mb-6">
        <h2 className="font-semibold mb-4">Profile</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={currentName}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-border rounded-default px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={data?.user.email || ""}
              disabled
              className="w-full border border-border rounded-default px-3 py-2 bg-surface text-text-muted cursor-not-allowed"
            />
            <p className="text-xs text-text-muted mt-1">Email cannot be changed.</p>
          </div>

          {profileMessage && (
            <p className={`text-sm ${profileMessage.includes("success") ? "text-success" : "text-error"}`}>
              {profileMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={savingProfile}
            className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-6 py-2 rounded-default font-medium text-sm"
          >
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      <div className="border border-border rounded-card p-6">
        <h2 className="font-semibold mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-border rounded-default px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-border rounded-default px-3 py-2"
            />
          </div>

          {passwordMessage && <p className="text-success text-sm">{passwordMessage}</p>}
          {passwordError && <p className="text-error text-sm">{passwordError}</p>}

          <button
            type="submit"
            disabled={changingPassword}
            className="bg-secondary hover:opacity-90 disabled:opacity-50 text-white px-6 py-2 rounded-default font-medium text-sm"
          >
            {changingPassword ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  )
}