"use client";

import { useEffect, useState } from "react";

export function IntroSplash({
  storageKey = "xuefen-intro-seen",
  force = false,
}: {
  storageKey?: string;
  force?: boolean;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem(storageKey);
    if (force || !seen) {
      setShow(true);
      sessionStorage.setItem(storageKey, "1");
      const timer = window.setTimeout(() => setShow(false), 2800);
      return () => window.clearTimeout(timer);
    }
  }, [force, storageKey]);

  if (!show) return null;

  return (
    <div className="intro-overlay" aria-hidden={!show}>
      <div className="intro-mark">
        <div className="intro-ring" />
        <div className="intro-title">學分通</div>
        <div className="intro-sub">畢業進度 · 一站掌握</div>
      </div>
    </div>
  );
}
