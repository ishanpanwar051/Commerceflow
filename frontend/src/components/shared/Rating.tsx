'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (value: number) => void;
}

export function Rating({ value, max = 5, size = 'sm', showValue, interactive, onChange }: RatingProps) {
  const sizeClass = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(i + 1)}
          className={cn(interactive && 'cursor-pointer hover:scale-110 transition-transform')}
        >
          <Star
            className={cn(
              sizeClass[size],
              i < Math.round(value) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            )}
          />
        </button>
      ))}
      {showValue && <span className="text-xs text-muted-foreground ml-1">({value})</span>}
    </div>
  );
}
