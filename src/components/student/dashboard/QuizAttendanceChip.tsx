import { CheckCircle2, Clock, UserX } from "lucide-react";
import { useMyQuizSession } from "../../../hooks/useQuizSessions";
import "./QuizAttendanceChip.css";

/**
 * The student's own attendance for the current sitting. Deliberately narrow —
 * they never see the roll or anyone else's status.
 */
export function QuizAttendanceChip() {
  const { data, isLoading } = useMyQuizSession();

  if (isLoading) return null;

  const session = data?.data?.session ?? null;

  // No sitting open yet is the normal resting state, not something to shout
  // about on the dashboard.
  if (!session) return null;

  const present = data?.data?.present === true;
  const unlocked = session.status === "unlocked";

  const tone = present ? (unlocked ? "live" : "present") : "absent";
  const icon = present ? (
    unlocked ? (
      <CheckCircle2 size={15} />
    ) : (
      <Clock size={15} />
    )
  ) : (
    <UserX size={15} />
  );

  const text = present
    ? unlocked
      ? `You are marked present for Sitting ${session.sitting} — your quiz is open.`
      : `You are marked present for Sitting ${session.sitting}. Wait for the quiz to be unlocked.`
    : `Sitting ${session.sitting} is open but you are not marked present yet.`;

  return (
    <div className={`qac qac--${tone}`}>
      {icon}
      <span>
        {text}
        {session.quiz?.title ? ` (${session.quiz.title})` : ""}
      </span>
    </div>
  );
}
