import { DashboardView } from '@/components/dashboard/dashboard-view'

export default function DashboardPage() {
  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Visualize your accountability journey with charts and insights.
        </p>
      </div>
      <DashboardView />
    </div>
  )
}
