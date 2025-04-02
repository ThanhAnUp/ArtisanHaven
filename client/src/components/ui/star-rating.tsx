import React from 'react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showCount = false,
  count = 0,
  className
}: StarRatingProps) {
  // Size mapping
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Convert rating to number of full, half, and empty stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn('flex items-center', className)}>
      <div className="flex text-yellow-400">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <i key={`full-${i}`} className={`bx bxs-star ${sizeClasses[size]}`}></i>
        ))}
        
        {/* Half star if needed */}
        {hasHalfStar && (
          <i className={`bx bxs-star-half ${sizeClasses[size]}`}></i>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <i key={`empty-${i}`} className={`bx bx-star ${sizeClasses[size]}`}></i>
        ))}
      </div>
      
      {showCount && (
        <span className="text-xs text-muted-foreground ml-2">
          ({count} {count === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
}
