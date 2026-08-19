/**
 * ResetIcon — inline SVG (replaces CSS mask to fix edge clipping artifacts).
 * Inherits parent's currentColor for automatic theme matching.
 */
export default function ResetIcon({ className = 'w-4 h-4', style, ...props }) {
  return (
    <img
      src="https://media.base44.com/images/public/6a312911bcddb0806c388af8/74832b145_transparentbackgroundResetIcon.svg"
      alt="Reset"
      className={className}
      style={{ flexShrink: 0, display: 'block', objectFit: 'contain', ...style }}
      {...props}
    />
  );
}