import { useEffect, useRef, useState } from "react";
import type { QuizTimer } from "../api/types/quiz";

/**
 * A quiz countdown driven by the SERVER's `secondsRemaining`, ticked down
 * locally against the monotonic `performance.now()` — never `expiresAt` and
 * the device clock, which a wrong or changed clock would break.
 *
 * Every new server reading (a fresh `serverTime`) re-anchors the count, so
 * polling the summary keeps it honest. Untimed quizzes (`durationMinutes`
 * null) report `timed: false` and no seconds — not zero.
 */
export function useQuizCountdown(timer?: QuizTimer | null) {
  const timed =
    timer?.durationMinutes != null && timer?.secondsRemaining != null;
  const serverSeconds = timed ? (timer?.secondsRemaining ?? null) : null;
  const serverTime = timer?.serverTime ?? null;

  const anchor = useRef<{ base: number; at: number } | null>(null);
  const [left, setLeft] = useState<number | null>(serverSeconds);

  // Re-anchor on each new server reading.
  useEffect(() => {
    anchor.current =
      serverSeconds === null
        ? null
        : { base: serverSeconds, at: performance.now() };
  }, [serverSeconds, serverTime]);

  // Tick. Four times a second so the display never lags a whole second
  // behind a re-anchor.
  useEffect(() => {
    if (!timed) return;
    const id = window.setInterval(() => {
      const a = anchor.current;
      if (!a) return;
      setLeft(Math.max(0, a.base - Math.floor((performance.now() - a.at) / 1000)));
    }, 250);
    return () => window.clearInterval(id);
  }, [timed]);

  const secondsLeft = timed ? left : null;
  return {
    timed,
    secondsLeft,
    /** `expired` from the server, or the local count reaching zero. */
    expired: Boolean(timer?.expired) || (timed && secondsLeft === 0),
    durationMinutes: timed ? (timer?.durationMinutes ?? null) : null,
  };
}

/** 1680 → "28:00", 3725 → "1:02:05". */
export function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

/** The newer of two server timer readings (by `serverTime`). */
export function newestTimer(
  a?: QuizTimer | null,
  b?: QuizTimer | null,
): QuizTimer | null {
  if (!a) return b ?? null;
  if (!b) return a;
  return Date.parse(b.serverTime) > Date.parse(a.serverTime) ? b : a;
}
