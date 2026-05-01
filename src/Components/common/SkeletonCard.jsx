/**
 * Animated skeleton placeholder card for loading states.
 * Use instead of a spinner when loading lists or card-based data.
 */
export const SkeletonCard = () => (
    <div className="animate-pulse rounded-2xl bg-white/5 border border-white/10 p-6">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-white/10 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-white/10 rounded w-3/4"></div>
    </div>
);

/**
 * A row of N skeleton cards for grid loading states.
 * @param {number} count - Number of skeleton cards to render (default: 4)
 */
export const SkeletonGrid = ({ count = 4 }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} />
        ))}
    </div>
);

export default SkeletonCard;

