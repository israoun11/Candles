// Replaceable product image slot. Swap for <img> once real photography is provided.
export default function Placeholder({ tone, label }: { tone: string; label: string }) {
  return (
    <svg className="ph" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${label} (image to be replaced)`}>
      <rect width="100" height="100" fill={tone} />
      <ellipse cx="50" cy="88" rx="30" ry="5" fill="rgba(73,54,47,.18)" />
      <rect x="38" y="30" width="24" height="56" rx="12" fill="rgba(255,255,255,.55)" />
      <rect x="49.3" y="20" width="1.4" height="12" fill="rgba(73,54,47,.55)" />
    </svg>
  );
}
