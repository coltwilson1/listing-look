// Elevate Marketing Co. wordmark. `tone="light"` for dark backgrounds.
export function LogoMark({ size = 30, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 21.5 L16 11 L24 21.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="miter" />
      <path d="M11.5 24.5 H20.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export default function Logo({ tone = "dark", href = "/", className = "" }) {
  const main = tone === "light" ? "text-white" : "text-ink";
  const sub = tone === "light" ? "text-champagne" : "text-brass";
  return (
    <a href={href} className={`inline-flex items-center gap-3 no-underline ${className}`} aria-label="Elevate Marketing Co. — home">
      <LogoMark className={sub} />
      <span className="flex flex-col leading-none">
        <span className={`font-serif text-[1.55rem] font-semibold tracking-[0.14em] uppercase ${main}`}>Elevate</span>
        <span className={`font-sans text-[0.58rem] font-medium tracking-[0.42em] uppercase mt-1 ${sub}`}>Marketing Co.</span>
      </span>
    </a>
  );
}
