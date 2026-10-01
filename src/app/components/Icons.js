// Thin line icons used across the marketing site (replaces emoji icons).
const PATHS = {
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="1.5" />
      <path d="M9 4.5V3h6v1.5M8.5 10h7M8.5 13.5h7M8.5 17h4" />
    </>
  ),
  chat: <path d="M4 5h16v11H9l-5 4V5zM8 9.5h8M8 12.5h5" />,
  handshake: (
    <>
      <circle cx="8" cy="8" r="3" />
      <circle cx="16.5" cy="8" r="3" />
      <path d="M2.5 20c.6-3.4 2.8-5.5 5.5-5.5s4.9 2.1 5.5 5.5M11.5 15.4c1.2-.6 2.9-.9 5-.9 2.7 0 4.9 2.1 5.5 5.5" />
    </>
  ),
  phone: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2" />
      <path d="M10.5 18.5h3" />
    </>
  ),
  package: (
    <>
      <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9z" />
      <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="1.5" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="m3.5 17 5-4.5 3.5 3 3-2.5 5.5 4.5" />
    </>
  ),
  home: <path d="M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5M10 20v-5h4v5" />,
  pen: <path d="M4 20l1-4.5L15.5 5a2 2 0 0 1 3 0l.5.5a2 2 0 0 1 0 3L8.5 19 4 20zM13.5 7l3.5 3.5" />,
  bolt: <path d="M13 2.5 5 13.5h6l-1 8 8-11h-6l1-8z" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
};

export default function Icon({ name, size = 22, strokeWidth = 1.4, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
