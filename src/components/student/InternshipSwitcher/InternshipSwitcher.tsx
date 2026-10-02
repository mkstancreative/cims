import { useEffect, useId, useRef, useState } from "react";
import { Briefcase, Check, ChevronDown } from "lucide-react";
import { useSelectedInternship } from "../../../context/useInternship";
import InternshipStatusBadge from "../../ui/StatusBadge/InternshipStatusBadge";
import {
  internshipBatch,
  internshipPeriod,
  internshipSession,
} from "../../../helpers/internship";
import "./InternshipSwitcher.css";

/**
 * Top-bar switcher between the student's internships. Every student page
 * shows the selected internship's records. Hidden with only one internship —
 * there's nothing to switch to.
 */
export default function InternshipSwitcher() {
  const { internships, selected, isCurrent, select } = useSelectedInternship();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (internships.length < 2 || !selected) return null;

  const name = internshipBatch(selected)?.name ?? "Internship";
  const session = internshipSession(selected);

  return (
    <div className="isw" ref={rootRef}>
      <button
        type="button"
        className={`isw__trigger${isCurrent ? "" : " is-past"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        title="Switch internship"
      >
        <Briefcase size={15} />
        <span className="isw__trigger-text">
          <span className="isw__trigger-label">
            {isCurrent ? "Current internship" : "Viewing past internship"}
          </span>
          <span className="isw__trigger-name">
            {name}
            {session && <small> · {session}</small>}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={`isw__chevron${open ? " is-open" : ""}`}
        />
      </button>

      {open && (
        <div className="isw__menu" id={menuId} role="listbox">
          <p className="isw__menu-head">Switch internship</p>
          {internships.map((it) => {
            const active = it._id === selected._id;
            const itSession = internshipSession(it);
            return (
              <button
                key={it._id}
                type="button"
                role="option"
                aria-selected={active}
                className={`isw__option${active ? " is-active" : ""}`}
                onClick={() => {
                  select(it._id);
                  setOpen(false);
                }}
              >
                <span className="isw__option-main">
                  <span className="isw__option-name">
                    {internshipBatch(it)?.name ?? "Internship"}
                    {it.isCurrent && (
                      <span className="isw__current-tag">Current</span>
                    )}
                  </span>
                  <span className="isw__option-meta">
                    {[itSession, internshipPeriod(it)]
                      .filter((v) => v && v !== "—")
                      .join(" · ")}
                  </span>
                  <InternshipStatusBadge status={it.itStatus} />
                </span>
                {active && <Check size={16} className="isw__check" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
