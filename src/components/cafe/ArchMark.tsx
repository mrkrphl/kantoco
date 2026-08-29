export default function ArchMark({
  className,
  title = "Concordia's Cafe",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label={title}
    >
      <rect width="64" height="64" fill="#00337F" />
      <path
        d="M16 50V30c0-8.8 7.2-16 16-16s16 7.2 16 16v20"
        fill="none"
        stroke="#EFEBE4"
        strokeWidth="2.4"
        strokeLinecap="square"
      />
      <path
        d="M20 38c4-5 8-5 12 0s8 5 12 0"
        fill="none"
        stroke="#EFEBE4"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
