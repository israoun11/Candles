import { useState, type ImgHTMLAttributes, type ReactNode } from 'react';

// Shows `fallback` (a placeholder) instead of a broken-image icon if the file is missing or fails to load.
export default function SafeImg({ fallback, ...img }: ImgHTMLAttributes<HTMLImageElement> & { fallback: ReactNode }) {
  const [bad, setBad] = useState(false);
  if (bad || !img.src) return <>{fallback}</>;
  return <img {...img} onError={() => setBad(true)} />;
}
