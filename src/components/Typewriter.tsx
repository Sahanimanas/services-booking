"use client";

import { useEffect, useState } from "react";

/**
 * Cycles through a list of words with a type → pause → delete → next loop.
 * Renders the current characters plus a blinking caret. The caret is given an
 * explicit text-* class because the typed text typically sits inside a
 * `bg-clip-text text-transparent` parent (gradient text), which would otherwise
 * make the caret invisible too.
 */
type Props = {
  words: string[];
  typingSpeed?: number; // ms per typed char
  deletingSpeed?: number; // ms per deleted char
  pauseAfter?: number; // ms to hold the fully-typed word
  pauseBefore?: number; // ms to hold the empty state before the next word
  caretClassName?: string;
};

export default function Typewriter({
  words,
  typingSpeed = 90,
  deletingSpeed = 45,
  pauseAfter = 1400,
  pauseBefore = 250,
  caretClassName = "text-accent-500",
}: Props) {
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "deleting">("typing");

  useEffect(() => {
    if (words.length === 0) return;
    const current = words[wordIdx];
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (charIdx < current.length) {
        timer = setTimeout(() => setCharIdx((c) => c + 1), typingSpeed);
      } else {
        timer = setTimeout(() => setPhase("deleting"), pauseAfter);
      }
    } else {
      if (charIdx > 0) {
        timer = setTimeout(() => setCharIdx((c) => c - 1), deletingSpeed);
      } else {
        timer = setTimeout(() => {
          setWordIdx((w) => (w + 1) % words.length);
          setPhase("typing");
        }, pauseBefore);
      }
    }

    return () => clearTimeout(timer);
  }, [charIdx, phase, wordIdx, words, typingSpeed, deletingSpeed, pauseAfter, pauseBefore]);

  const displayed = words[wordIdx]?.slice(0, charIdx) ?? "";

  return (
    <>
      {displayed}
      <span
        aria-hidden="true"
        className={"ml-[0.04em] animate-pulse " + caretClassName}
      >
        |
      </span>
    </>
  );
}
