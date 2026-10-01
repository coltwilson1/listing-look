// Elevate Marketing Co. logo. `tone="light"` for dark backgrounds.
const RATIO = 930 / 375;

export function LogoImage({ tone = "dark", height = 44, className = "" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={tone === "light" ? "/logos/elevate-logo-light.png" : "/logos/elevate-logo-dark.png"}
      alt="Elevate Marketing Co."
      height={height}
      width={Math.round(height * RATIO)}
      className={`inline-block align-middle ${className}`}
      style={{ height, width: "auto" }}
    />
  );
}

export default function Logo({ tone = "dark", href = "/", height = 44, className = "" }) {
  return (
    <a href={href} className={`inline-flex items-center no-underline ${className}`} aria-label="Elevate Marketing Co. — home">
      <LogoImage tone={tone} height={height} />
    </a>
  );
}
