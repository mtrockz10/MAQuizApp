import { useState } from "react"
import { KeyRound, ShieldCheck, UserRound } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"

export default function AdminAccountSettings() {
  const { user, updateCredentials } = useAuth()
  const toast = useToast()
  const [username, setUsername] = useState(user?.username || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.")
      return
    }

    setSaving(true)
    try {
      await updateCredentials({ username, currentPassword, newPassword })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Admin account settings updated.")
    } catch (error) {
      toast.error(error.message || "Account settings could not be updated.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold heading text-gray-900 dark:text-white">Admin account</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Update the username and password used to sign in as an administrator.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Sign-in credentials</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Confirm your current password before saving. Leave the new password blank to keep it unchanged.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="admin-username">Username</Label>
            <div className="relative">
              <UserRound size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                id="admin-username"
                className="pl-10"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="admin-current-password">Current password</Label>
            <Input
              id="admin-current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="admin-new-password">New password</Label>
              <Input
                id="admin-new-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <Label htmlFor="admin-confirm-password">Confirm new password</Label>
              <Input
                id="admin-confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat new password"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
            <KeyRound size={17} className="mt-0.5 shrink-0" />
            <p>Passwords are stored in this demo app’s browser storage. Do not reuse a sensitive password.</p>
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-5 dark:border-gray-700">
            <Button type="submit" variant="primary" disabled={saving || !currentPassword}>
              {saving ? "Saving..." : "Save account settings"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
