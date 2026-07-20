/**
 * ResetIcon — inline SVG (replaces CSS mask to fix edge clipping artifacts).
 * Inherits parent's currentColor for automatic theme matching.
 */
export default function ResetIcon({ className = 'w-4 h-4', style, ...props }) {
  return (
    <svg
      className={className}
      style={{ flexShrink: 0, display: 'block', ...style }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}