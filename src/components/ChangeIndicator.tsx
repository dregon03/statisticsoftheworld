interface ChangeIndicatorProps {
  value: number | null;
  decimals?: number;
  showSign?: boolean;
  className?: string;
}

export default function ChangeIndicator({ value, decimals = 2, showSign = true, className = '' }: ChangeIndicatorProps) {
  if (value === null || value === undefined || isNaN(value)) {
    return <span className={`text-[#999] ${className}`}>—</span>;
  }

  const isPositive = value >= 0;
  const color = isPositive ? 'text-[#2ecc40]' : 'text-[#e74c3c]';
  const sign = showSign && isPositive ? '+' : '';

  return (
    <span className={`${color} ${className}`}>
      {sign}{value.toFixed(decimals)}%
    </span>
  );
}
