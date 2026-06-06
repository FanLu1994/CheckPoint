import type { SVGProps } from "react";

export default function CheckpointIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 128 128"
      role="img"
      aria-label="Checkpoint"
      {...props}
    >
      <rect width="128" height="128" rx="24" fill="#1a1915" />
      <path
        d="M22 30h84M22 98h84"
        stroke="#d4cfc5"
        strokeOpacity=".14"
        strokeWidth="2"
      />
      <rect x="28" y="40" width="14" height="48" rx="3" fill="#f5f3ef" />
      <rect x="50" y="30" width="14" height="58" rx="3" fill="#00a86b" />
      <rect x="72" y="50" width="14" height="38" rx="3" fill="#d48806" />
      <path
        d="M35 48v30M57 38v42M79 58v20"
        stroke="#1a1915"
        strokeOpacity=".38"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M32 96h20l15-15 10 10 23-28"
        fill="none"
        stroke="#00a86b"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="100" cy="63" r="13" fill="#1a1915" stroke="#00a86b" strokeWidth="6" />
      <path
        d="M94 63l4 4 9-10"
        fill="none"
        stroke="#f5f3ef"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
