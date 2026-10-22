import type { GownShape } from "@/lib/cgr-gowns";

/** Flat gown illustrations (no people, no photos). viewBox 200x260. */
const SKIRTS: Record<GownShape, string> = {
  ball: "M82 96 Q100 102 118 96 C150 150 176 200 184 244 Q100 262 16 244 C24 200 50 150 82 96 Z",
  aline:
    "M82 96 Q100 102 118 96 C132 150 150 205 160 246 Q100 258 40 246 C50 205 68 150 82 96 Z",
  mermaid:
    "M82 96 Q100 102 118 96 C124 140 120 178 114 198 C132 222 152 238 166 250 Q100 260 34 250 C48 238 68 222 86 198 C80 178 76 140 82 96 Z",
  tulle:
    "M82 96 Q100 102 118 96 C146 146 168 196 178 240 Q166 252 150 246 Q138 258 122 250 Q110 260 100 252 Q90 260 78 250 Q62 258 50 246 Q34 252 22 240 C32 196 54 146 82 96 Z",
};

const FOLDS: Record<GownShape, string> = {
  ball: "M92 104 Q80 170 58 240 M100 104 V252 M108 104 Q120 170 142 240",
  aline: "M94 104 Q86 170 74 246 M106 104 Q114 170 126 246",
  mermaid: "M96 104 Q94 160 92 200 Q84 226 70 248 M104 104 Q106 160 108 200 Q116 226 130 248",
  tulle: "M90 104 Q74 170 50 238 M100 104 V248 M110 104 Q126 170 150 238",
};

export function GownArt({
  shape,
  color,
  shade,
  title,
}: {
  shape: GownShape;
  color: string;
  shade: string;
  title: string;
}) {
  const id = `g-${shape}`;
  return (
    <svg
      className="cg-art"
      viewBox="0 0 200 260"
      role="img"
      aria-label={title}
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-f`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={shade} />
          <stop offset="0.45" stopColor={color} />
          <stop offset="1" stopColor={shade} />
        </linearGradient>
      </defs>
      <path d="M100 6 V30" stroke="#a8843c" strokeWidth="3" />
      <path
        d="M90 14 Q100 4 110 14"
        fill="none"
        stroke="#a8843c"
        strokeWidth="2.5"
      />
      <path
        d="M86 38 Q100 30 114 38 L118 96 Q100 102 82 96 Z"
        fill={`url(#${id}-f)`}
      />
      {shape === "tulle" ? (
        <path d={SKIRTS.ball} fill={color} opacity="0.35" />
      ) : null}
      <path d={SKIRTS[shape]} fill={`url(#${id}-f)`} />
      <path
        d={FOLDS[shape]}
        fill="none"
        stroke="#fff"
        strokeOpacity="0.22"
        strokeWidth="2"
      />
      <path d="M83 96 Q100 102 117 96" fill="none" stroke="#a8843c" strokeWidth="2.5" />
    </svg>
  );
}

export function EarringsArt() {
  return (
    <svg
      className="cg-art"
      viewBox="0 0 200 160"
      role="img"
      aria-label="Teal crystal drop earrings"
      focusable="false"
    >
      {[66, 134].map((x) => (
        <g key={x}>
          <circle cx={x} cy="28" r="7" fill="none" stroke="#a8843c" strokeWidth="3" />
          <path d={`M${x} 35 V52`} stroke="#a8843c" strokeWidth="3" />
          <circle cx={x} cy="58" r="6" fill="#e8d7a8" stroke="#a8843c" strokeWidth="2" />
          <path
            d={`M${x} 66 C${x + 18} 92 ${x + 16} 124 ${x} 134 C${x - 16} 124 ${x - 18} 92 ${x} 66 Z`}
            fill="#127f86"
            stroke="#a8843c"
            strokeWidth="3"
          />
          <path
            d={`M${x - 5} 92 Q${x} 82 ${x + 4} 96`}
            stroke="#bff3f2"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  );
}
