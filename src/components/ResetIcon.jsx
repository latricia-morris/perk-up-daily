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
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Top arrow: starts at top center, curves clockwise, arrowhead top-left */}
      <path d="M12 3 a9 9 0 0 1 6.5 2.7" />
      <path d="M18.5 2v5h-5" />
      {/* Bottom arrow: starts at bottom center, curves counter-clockwise, arrowhead bottom-right */}
      <path d="M12 21 a9 9 0 0 1 -6.5 -2.7" />
      <path d="M5.5 22v-5h5" />
      {/* Inner circle */}
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}