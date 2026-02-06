import { SettingsView } from '@/components/settings/settings-view'

export default function SettingsPage() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, partnership, and preferences.
        </p>
      </div>
      <SettingsView />
    </div>
  )
}
