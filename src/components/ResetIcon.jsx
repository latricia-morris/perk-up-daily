/**
 * ResetIcon — renders the uploaded Reset.svg as a CSS mask,
 * inheriting the parent's text color (currentColor) so it matches
 * active/inactive states automatically across all layouts.
 */
const RESET_SVG_URL = 'https://media.base44.com/images/public/6a312911bcddb0806c388af8/3b05d95de_Reset.svg';

export default function ResetIcon({ className = 'w-4 h-4', style, strokeWidth, ...props }) {
  return (
    <span
      className={className}
      style={{
        display: 'block',
        flexShrink: 0,
        boxSizing: 'border-box',
        WebkitMaskImage: `url(${RESET_SVG_URL})`,
        maskImage: `url(${RESET_SVG_URL})`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        backgroundColor: 'currentColor',
        ...style,
      }}
    />
  );
}