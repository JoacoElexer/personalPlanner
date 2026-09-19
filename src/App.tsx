import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Personal Planner</h1>
      <p className="text-muted-foreground">
        Base lista: Vite + React + TypeScript + Tailwind v4 + Capacitor 8.
      </p>
      <Button onClick={() => setCount((c) => c + 1)}>Contador: {count}</Button>
      <Toaster />
    </main>
  )
}

export default App
