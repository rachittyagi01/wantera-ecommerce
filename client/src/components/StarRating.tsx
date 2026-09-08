interface StarRatingProps {
  rating: number
  size?: "sm" | "md"
}

export function StarRating({ rating, size = "sm" }: StarRatingProps) {
  const starSize = size === "sm" ? "text-sm" : "text-xl"
  return (
    <span className={`text-warning ${starSize}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>{star <= Math.round(rating) ? "★" : "☆"}</span>
      ))}
    </span>
  )
}