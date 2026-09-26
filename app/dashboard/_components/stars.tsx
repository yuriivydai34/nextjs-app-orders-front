// 1–5 stars, read-only. Used by the reviews page and the order details.
export default function Stars({ rating, size = 'text-base' }: { rating: number; size?: string }) {
  return (
    <span className={`${size} leading-none whitespace-nowrap`} title={`${rating} з 5`} aria-label={`${rating} з 5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}>★</span>
      ))}
    </span>
  );
}
