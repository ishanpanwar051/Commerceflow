'use client';

import { Button } from '@/components/ui/button';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-destructive mb-4">500</h1>
        <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">An unexpected error occurred.</p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
