/**
 * ProgressIndicator - 運動表現進步/退步指標
 * Feature: 003-student-sports-data (US4)
 */

interface ProgressIndicatorProps {
  currentValue: number;
  previousValue: number;
  unit: string;
  valueType: 'time' | 'distance' | 'count';
  size?: 'sm' | 'md' | 'lg';
}

export default function ProgressIndicator({
  currentValue,
  previousValue,
  unit,
  valueType,
  size = 'md',
}: ProgressIndicatorProps) {
  const change = currentValue - previousValue;
  const percentChange = ((change / previousValue) * 100).toFixed(1);

  // For time-based metrics, lower is better
  const isLowerBetter = valueType === 'time';
  const isImproving = isLowerBetter ? change < 0 : change > 0;
  const isNeutral = change === 0;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full font-medium ${
        sizeClasses[size]
      } ${
        isImproving
          ? 'bg-green-100 text-green-800'
          : isNeutral
          ? 'bg-gray-100 text-gray-800'
          : 'bg-red-100 text-red-800'
      }`}
    >
      {isImproving ? (
        <svg
          className={iconSizes[size]}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      ) : isNeutral ? (
        <svg
          className={iconSizes[size]}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 12H4"
          />
        </svg>
      ) : (
        <svg
          className={iconSizes[size]}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      )}
      <span>
        {isImproving ? '進步' : isNeutral ? '持平' : '退步'}{' '}
        {Math.abs(parseFloat(percentChange))}%
      </span>
      <span className="text-opacity-70">
        ({change > 0 ? '+' : ''}
        {change.toFixed(1)} {unit})
      </span>
    </div>
  );
}
