import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-surface p-8 rounded-card border border-border text-center">
        <h1 className="text-4xl font-display font-bold text-primary mb-2">
          WANTERA
        </h1>
        <p className="text-text-muted mb-4">Want It. Find It. Love It.</p>
        <Button>Shop Now</Button>
      </div>
    </div>
  )
}

export default App