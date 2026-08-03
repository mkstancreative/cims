import { useState, type FormEvent } from "react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import { useCreateLogBook, useUpdateLogBook } from "../../../hooks/useLogBooks";
import { useLogBookById } from "../../../hooks/useLogBooks";
import { useMyCurriculum } from "../../../hooks/useCurriculum";
import { refId } from "../../../helpers/logbook";
import type {
  CreateLogBookEntryPayload,
  LogBookListItem,
} from "../../../api/types/logbook";
import type { Curriculum } from "../../../api/types/curriculum";
import { BookOpen, Pencil } from "lucide-react";
import "./CreateLogBookDraft.css";

// ─── Blank entry factory ────────────────────────────────────────────────────
const blankEntry = (curriculumId = ""): CreateLogBookEntryPayload => ({
  curriculum: curriculumId,
  topic: "",
  subtopic: "",
  notes: "",
  hoursSpent: 3,
  date: "",
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

  const { data: editData, isLoading: loadingEdit } = useLogBookById(
    logbook?._id ?? "",
  );
  const { data: curriculumData, isLoading: loadingCurricula } =
    useMyCurriculum();

  const curricula: Curriculum[] = curriculumData?.data?.curricula ?? [];

  // Build edit initial state from the flat entry data.
  const initialEntry: CreateLogBookEntryPayload | undefined = editData?.data
    ? {
        date: editData.data.date ? editData.data.date.slice(0, 10) : "",
        curriculum: refId(editData.data.curriculum),
        topic: refId(editData.data.topic),
        subtopic: refId(editData.data.subtopic),
        notes: editData.data.notes ?? "",
        hoursSpent: editData.data.hoursSpent,
      }
    : undefined;

  const isLoading = (isEdit && loadingEdit) || loadingCurricula;

  if (isLoading) {
    return (
      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        title={isEdit ? `Edit Logbook Entry` : "New Logbook Entry"}
        subtitle="Loading entry…"
        icon={<Pencil size={16} />}
        size="medium"
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
      title={isEdit ? `Edit Logbook Entry` : "New Logbook Entry"}
      subtitle={
        isEdit
          ? "Update your logbook activity"
          : "Record a clinical logbook activity"
      }
      icon={isEdit ? <Pencil size={16} /> : <BookOpen size={16} />}
      size="medium"
    >
      <CreateLogBookDraftInner
        key={logbook?._id ?? "new"}
        onClose={onClose}
        editId={logbook?._id}
        status={logbook?.status}
        initialEntry={initialEntry}
        curricula={curricula}
      />
    </CustomModal>
  );
}

function CreateLogBookDraftInner({
  onClose,
  editId,
  status,
  initialEntry,
  curricula,
}: {
  onClose: () => void;
  editId?: string;
  status?: string;
  initialEntry?: CreateLogBookEntryPayload;
  curricula: Curriculum[];
}) {
  const isEdit = !!editId;

  const defaultCurriculumId = curricula.length === 1 ? curricula[0]._id : "";

  const [form, setForm] = useState<CreateLogBookEntryPayload>(
    () => initialEntry ?? blankEntry(defaultCurriculumId),
  );

  const { mutate: create, isPending: creating } = useCreateLogBook();
  const { mutate: update, isPending: updating } = useUpdateLogBook();
  const isPending = creating || updating;

  // ── Curriculum lookups ────────────────────────────────────────────────────
  const findCurriculum = (id: string) => curricula.find((c) => c._id === id);
  const topicsFor = (curriculumId: string) =>
    (findCurriculum(curriculumId)?.topics ?? []).filter((t) => t._id);
  const subtopicsFor = (curriculumId: string, topicId: string) =>
    (topicsFor(curriculumId).find((t) => t._id === topicId)?.subtopics ?? []).filter(
      (s) => s._id,
    );

  const topics = topicsFor(form.curriculum);
  const subtopics = subtopicsFor(form.curriculum, form.topic);

  // ── Field setters ─────────────────────────────────────────────────────────
  const setField = <K extends keyof CreateLogBookEntryPayload>(
    key: K,
    value: CreateLogBookEntryPayload[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const setCurriculum = (value: string) =>
    setForm((prev) => ({ ...prev, curriculum: value, topic: "", subtopic: "" }));

  const setTopic = (value: string) =>
    setForm((prev) => ({ ...prev, topic: value, subtopic: "" }));

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isEdit && editId) {
      update({ id: editId, payload: form }, { onSuccess: onClose });
    } else {
      create(form, { onSuccess: onClose });
    }
  };

  const noCurricula = curricula.length === 0;

  return (
    <form id="create-logbook-form" onSubmit={handleSubmit} className="lb-form">
      {noCurricula && (
        <div className="lb-empty-curricula">
          No curriculum has been linked to your batch yet. Please contact your
          coordinator.
        </div>
      )}

      {/* ── Date & Hours ── */}
      <div className="lb-row-2">
        <div className="form-group">
          <label className="modal-label">
            Date <span>*</span>
          </label>
          <input
            type="date"
            className="modal-input"
            max={new Date().toISOString().split("T")[0]}
            value={form.date}
            onChange={(e) => setField("date", e.target.value)}
            required
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
            value={form.hoursSpent}
            onChange={(e) => setField("hoursSpent", Number(e.target.value))}
            required
          />
        </div>
      </div>

      {/* ── Curriculum ── */}
      <div className="form-group">
        <label className="modal-label">
          Curriculum <span>*</span>
        </label>
        <select
          className="modal-input"
          value={form.curriculum}
          onChange={(e) => setCurriculum(e.target.value)}
          required
          disabled={noCurricula}
        >
          <option value="">Select curriculum</option>
          {curricula.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* ── Topic & Subtopic ── */}
      <div className="lb-row-2">
        <div className="form-group">
          <label className="modal-label">
            Topic <span>*</span>
          </label>
          <select
            className="modal-input"
            value={form.topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            disabled={!form.curriculum}
          >
            <option value="">
              {form.curriculum ? "Select topic" : "Select a curriculum first"}
            </option>
            {topics.map((t) => (
              <option key={t._id} value={t._id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="modal-label">
            Subtopic <span>*</span>
          </label>
          <select
            className="modal-input"
            value={form.subtopic}
            onChange={(e) => setField("subtopic", e.target.value)}
            required
            disabled={!form.topic}
          >
            <option value="">
              {form.topic ? "Select subtopic" : "Select a topic first"}
            </option>
            {subtopics.map((s) => (
              <option key={s._id} value={s._id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Notes ── */}
      <div className="form-group">
        <label className="modal-label">
          Notes <span>*</span>
        </label>
        <textarea
          className="modal-input lb-textarea"
          rows={4}
          placeholder="What did you observe, assist with, or perform?"
          value={form.notes}
          onChange={(e) => setField("notes", e.target.value)}
          required
        />
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
        <button
          type="submit"
          className="modal-submit"
          disabled={isPending || noCurricula}
        >
          {isPending
            ? "Saving…"
            : isEdit
              ? status === "needs_revision"
                ? "Save Revisions"
                : "Update Entry"
              : "Save Entry"}
        </button>
      </div>
    </form>
  );
}
