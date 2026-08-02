import { useState, type FormEvent } from "react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import { useCreateLogBook, useUpdateLogBook } from "../../../hooks/useLogBooks";
import { useLogBookById } from "../../../hooks/useLogBooks";
import type {
  CreateLogBookPayload,
  LogBookActivity,
  LogBookListItem,
} from "../../../api/types/logbook";
import {
  BookOpen,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Pencil,
} from "lucide-react";
import RichTextEditor from "../../ui/RichTextEditor/RichTextEditor";
import "./CreateLogBookDraft.css";

// ─── Blank activity factory ─────────────────────────────────────────────────────
const blankActivity = (): Omit<LogBookActivity, "_id"> => ({
  date: "",
  dayOfWeek: "Monday",
  activity: "",
  description: "",
  hoursSpent: 8,
  skillsUsed: [],
});

// ─── Build initial form state ───────────────────────────────────────────────────
const buildInitial = (): CreateLogBookPayload => ({
  weekNumber: 1,
  title: "",
  activities: [blankActivity()],
  challengesFaced: "",
  lessonsLearned: "",
  nextWeekPlan: "",
});

interface CreateLogBookDraftProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pass an existing list item to open in Edit mode */
  logbook?: LogBookListItem;
}

export default function CreateLogBookDraft({
  isOpen,
  onClose,
  logbook,
}: CreateLogBookDraftProps) {
  const isEdit = !!logbook;

  // Fetch the full entry when editing — done here so the inner form
  // can use the data as its lazy initial state (no useEffect needed).
  const { data: editData, isLoading: loadingEdit } = useLogBookById(
    logbook?._id ?? "",
  );

  // Build initial form & skill arrays from fetched data
  const initialForm: CreateLogBookPayload | undefined = editData?.data
    ? (() => {
        const lb = editData.data;
        const acts = lb.activities.map(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ({ _id, ...rest }) => {
            const dateStr = rest.date ? rest.date.slice(0, 10) : "";
            let derivedDay = rest.dayOfWeek;
            if (dateStr) {
              const [y, m, d] = dateStr.split("-");
              const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
              if (!isNaN(dateObj.getTime())) {
                derivedDay = dateObj.toLocaleDateString("en-US", {
                  weekday: "long",
                });
              }
            }
            return {
              ...rest,
              date: dateStr,
              dayOfWeek: derivedDay ?? "Monday",
            };
          },
        );
        return {
          weekNumber: lb.weekNumber,
          title: lb.title,
          activities: acts.length ? acts : [blankActivity()],
          challengesFaced: lb.challengesFaced ?? "",
          lessonsLearned: lb.lessonsLearned ?? "",
          nextWeekPlan: lb.nextWeekPlan ?? "",
        };
      })()
    : undefined;

  const initialSkills = initialForm
    ? initialForm.activities.map(() => "")
    : undefined;

  // Show spinner while edit data loads
  if (isEdit && loadingEdit) {
    return (
      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        title={`Edit Week ${logbook!.weekNumber} Entry`}
        subtitle="Update your weekly IT training activities"
        icon={<Pencil size={16} />}
        size="wide"
      >
        <div className="lb-loading">
          <span className="lb-loading-spinner" />
          Loading entry…
        </div>
      </CustomModal>
    );
  }

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit ? `Edit Week ${logbook!.weekNumber} Entry` : "New Log Book Entry"
      }
      subtitle={
        isEdit
          ? "Update your weekly IT training activities"
          : "Record your weekly IT training activities"
      }
      icon={isEdit ? <Pencil size={16} /> : <BookOpen size={16} />}
      size="wide"
    >
      {/* key forces remount when editId changes, giving a fresh form state */}
      <CreateLogBookDraftInner
        key={logbook?._id ?? "new"}
        onClose={onClose}
        editId={logbook?._id}
        status={logbook?.status}
        initialForm={initialForm}
        initialSkills={initialSkills}
      />
    </CustomModal>
  );
}

function CreateLogBookDraftInner({
  onClose,
  editId,
  status,
  initialForm,
  initialSkills,
}: {
  onClose: () => void;
  editId?: string;
  status?: string;
  initialForm?: CreateLogBookPayload;
  initialSkills?: string[];
}) {
  const isEdit = !!editId;

  const [form, setForm] = useState<CreateLogBookPayload>(
    initialForm ?? buildInitial,
  );
  const [expandedIdx, setExpandedIdx] = useState<number>(0);
  const [skillInput, setSkillInput] = useState<string[]>(initialSkills ?? [""]);

  const { mutate: create, isPending: creating } = useCreateLogBook();
  const { mutate: update, isPending: updating } = useUpdateLogBook();
  const isPending = creating || updating;

  // ── Top-level field setter ────────────────────────────────────────────────
  const setField = <K extends keyof CreateLogBookPayload>(
    key: K,
    value: CreateLogBookPayload[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  // ── Activity field setter ─────────────────────────────────────────────────
  const setActivityField = <K extends keyof Omit<LogBookActivity, "_id">>(
    idx: number,
    key: K,
    value: Omit<LogBookActivity, "_id">[K],
  ) =>
    setForm((prev) => {
      const acts = [...prev.activities];
      acts[idx] = { ...acts[idx], [key]: value };
      return { ...prev, activities: acts };
    });

  // ── Skills tag management ─────────────────────────────────────────────────
  const addSkill = (idx: number) => {
    const val = skillInput[idx]?.trim();
    if (!val) return;

    // Split by comma and filter out empty strings
    const skillsToAdd = val
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (skillsToAdd.length === 0) return;

    const current = form.activities[idx]?.skillsUsed ?? [];
    // Add only new skills (avoid duplicates)
    const newSkills = skillsToAdd.filter((s) => !current.includes(s));

    if (newSkills.length > 0) {
      setActivityField(idx, "skillsUsed", [...current, ...newSkills]);
    }

    setSkillInput((prev) => {
      const next = [...prev];
      next[idx] = "";
      return next;
    });
  };

  const removeSkill = (actIdx: number, skill: string) => {
    const current = form.activities[actIdx]?.skillsUsed ?? [];
    setActivityField(
      actIdx,
      "skillsUsed",
      current.filter((s) => s !== skill),
    );
  };

  // ── Activities management ─────────────────────────────────────────────────
  const addActivity = () => {
    setForm((prev) => ({
      ...prev,
      activities: [...prev.activities, blankActivity()],
    }));
    setSkillInput((prev) => [...prev, ""]);
    setExpandedIdx(form.activities.length);
  };

  const removeActivity = (idx: number) => {
    if (form.activities.length <= 1) return;
    setForm((prev) => {
      const acts = [...prev.activities];
      acts.splice(idx, 1);
      return { ...prev, activities: acts };
    });
    setSkillInput((prev) => {
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });
    setExpandedIdx((prev) => Math.max(0, prev > idx ? prev - 1 : prev));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isEdit && editId) {
      update({ id: editId, payload: form }, { onSuccess: onClose });
    } else {
      create(form, { onSuccess: onClose });
    }
  };

  const totalHours = form.activities.reduce(
    (sum, a) => sum + (Number(a.hoursSpent) || 0),
    0,
  );

  return (
    <form id="create-logbook-form" onSubmit={handleSubmit} className="lb-form">
      {/* ── Week info ── */}
      <div className="lb-section">
        <div className="lb-row-2">
          <div className="form-group">
            <label className="modal-label">
              Week Number <span>*</span>
            </label>
            <input
              type="number"
              min={1}
              max={26}
              className="modal-input"
              value={form.weekNumber}
              onChange={(e) => setField("weekNumber", Number(e.target.value))}
              required
            />
          </div>
          <div className="form-group">
            <label className="modal-label">
              Week Title <span>*</span>
            </label>
            <input
              className="modal-input"
              placeholder="e.g. Introduction to Development Environment"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* ── Activities ── */}
      <div className="lb-section">
        <div className="lb-section-header">
          <span className="lb-section-label">
            Daily Activities
            <span className="lb-badge">{form.activities.length}</span>
          </span>
          <span className="lb-hours-total">{totalHours} hrs total</span>
        </div>

        <div className="lb-activities-list">
          {form.activities.map((act, idx) => {
            const isOpen = expandedIdx === idx;
            return (
              <div
                key={idx}
                className={`lb-activity-card ${isOpen ? "expanded" : ""}`}
              >
                {/* Accordion header */}
                <div
                  className="lb-activity-header"
                  onClick={() => setExpandedIdx(isOpen ? -1 : idx)}
                >
                  <div className="lb-activity-header-left">
                    <span className="lb-day-badge">
                      {act.dayOfWeek || `Day ${idx + 1}`}
                    </span>
                    <span className="lb-activity-title-preview">
                      {act.activity || "Untitled activity"}
                    </span>
                  </div>
                  <div className="lb-activity-header-right">
                    <span className="lb-hrs-chip">{act.hoursSpent}h</span>
                    <button
                      type="button"
                      className="lb-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeActivity(idx);
                      }}
                      title="Remove activity"
                    >
                      <Trash2 size={13} />
                    </button>
                    {isOpen ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </div>
                </div>

                {/* Accordion body */}
                {isOpen && (
                  <div className="lb-activity-body">
                    <div className="lb-row-3">
                      <div className="form-group">
                        <label className="modal-label">
                          Date <span>*</span>
                        </label>
                        <input
                          type="date"
                          className="modal-input"
                          max={new Date().toISOString().split("T")[0]}
                          value={act.date}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                              const [y, m, d] = val.split("-");
                              const dateObj = new Date(
                                Number(y),
                                Number(m) - 1,
                                Number(d),
                              );
                              if (!isNaN(dateObj.getTime())) {
                                const dayName = dateObj.toLocaleDateString(
                                  "en-US",
                                  { weekday: "long" },
                                );
                                setForm((prev) => {
                                  const acts = [...prev.activities];
                                  acts[idx] = {
                                    ...acts[idx],
                                    date: val,
                                    dayOfWeek: dayName,
                                  };
                                  return { ...prev, activities: acts };
                                });
                                return;
                              }
                            }
                            setActivityField(idx, "date", val);
                          }}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="modal-label">Day of Week</label>
                        <input
                          type="text"
                          className="modal-input"
                          value={act.dayOfWeek}
                          readOnly
                          disabled
                          style={{
                            backgroundColor: "var(--color-bg-secondary)",
                            cursor: "not-allowed",
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="modal-label">
                          Hours Spent <span>*</span>
                        </label>
                        <input
                          type="number"
                          min={0.5}
                          max={24}
                          step={0.5}
                          className="modal-input"
                          value={act.hoursSpent}
                          onChange={(e) =>
                            setActivityField(
                              idx,
                              "hoursSpent",
                              Number(e.target.value),
                            )
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="modal-label">
                        Activity / Task <span>*</span>
                      </label>
                      <input
                        className="modal-input"
                        placeholder="e.g. Development Environment Setup"
                        value={act.activity}
                        onChange={(e) =>
                          setActivityField(idx, "activity", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="modal-label">
                        Description <span>*</span>
                      </label>
                      <RichTextEditor
                        placeholder="Describe what you did in detail…"
                        value={act.description}
                        onChange={(html) =>
                          setActivityField(idx, "description", html)
                        }
                      />
                    </div>

                    {/* Skills */}
                    <div className="form-group">
                      <label className="modal-label">Skills Used</label>
                      <div className="lb-skills-tags">
                        {act.skillsUsed.map((s) => (
                          <span key={s} className="lb-skill-tag">
                            {s}
                            <button
                              type="button"
                              onClick={() => removeSkill(idx, s)}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="lb-skill-input-row">
                        <input
                          className="modal-input"
                          placeholder="Type a skill and press Add…"
                          value={skillInput[idx] ?? ""}
                          onChange={(e) => {
                            const next = [...skillInput];
                            next[idx] = e.target.value;
                            setSkillInput(next);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addSkill(idx);
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="lb-add-skill-btn"
                          onClick={() => addSkill(idx)}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="lb-add-activity-btn"
          onClick={addActivity}
        >
          <Plus size={14} /> Add Another Day
        </button>
      </div>

      {/* ── Reflections ── */}
      <div className="lb-section">
        <div className="lb-section-label">Weekly Reflections</div>
        <div className="form-group">
          <label className="modal-label">Challenges Faced</label>
          <textarea
            className="modal-input lb-textarea"
            rows={3}
            placeholder="What challenges did you encounter this week?"
            value={form.challengesFaced}
            onChange={(e) => setField("challengesFaced", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="modal-label">Lessons Learned</label>
          <textarea
            className="modal-input lb-textarea"
            rows={3}
            placeholder="What did you learn from these experiences?"
            value={form.lessonsLearned}
            onChange={(e) => setField("lessonsLearned", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="modal-label">Next Week's Plan</label>
          <textarea
            className="modal-input lb-textarea"
            rows={3}
            placeholder="What do you plan to work on next week?"
            value={form.nextWeekPlan}
            onChange={(e) => setField("nextWeekPlan", e.target.value)}
          />
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="modal-actions">
        <button
          type="button"
          className="modal-cancel"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </button>
        <button type="submit" className="modal-submit" disabled={isPending}>
          {isPending
            ? "Saving…"
            : isEdit
              ? status === "needs_revision"
                ? "Save Revisions"
                : "Update Draft"
              : "Save as Draft"}
        </button>
      </div>
    </form>
  );
}
