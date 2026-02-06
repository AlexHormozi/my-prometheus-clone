import { CompareView } from '@/components/compare/compare-view'

export default function ComparePage() {
  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Compare</h1>
        <p className="text-muted-foreground">
          See how you and your partner are doing side by side.
        </p>
      </div>
      <CompareView />
    </div>
  )
}
