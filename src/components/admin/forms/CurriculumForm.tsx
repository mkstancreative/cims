import { useState, type DragEvent, type FormEvent } from "react";
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import {
  useCreateCurriculum,
  useUpdateCurriculum,
  useCurriculum,
} from "../../../hooks/useCurriculum";
import type {
  CreateCurriculumPayload,
  Curriculum,
} from "../../../api/types/curriculum";
import "./BuilderForm.css";

// ── Builder types ─────────────────────────────────────────────────────────────
//
// Array position is the order, so nothing here carries an `order`. `_id` is
// carried through untouched: a PUT replaces the topics array wholesale and
// anything arriving without an id is recreated with a new one, which would
// orphan every logbook entry tagged to the old subtopic id.
interface DraftSubtopic {
  _id?: string;
  title: string;
  description: string;
}
interface DraftTopic {
  _id?: string;
  title: string;
  description: string;
  subtopics: DraftSubtopic[];
}

function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

interface CurriculumFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingId?: string;
}

export default function CurriculumForm({
  isOpen,
  onClose,
  editingId,
}: CurriculumFormProps) {
  const { data, isLoading: loadingCurriculum } = useCurriculum(editingId || "");
  const curriculum = data?.data;

  if (editingId && loadingCurriculum) {
    return (
      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        title="Edit Curriculum"
        subtitle="Loading curriculum details…"
        icon={<BookOpen size={16} />}
        size="large"
        isLoading={true}
        footer={
          <button
            type="button"
            className="modal-cancel"
            onClick={onClose}
            disabled={true}
          >
            Cancel
          </button>
        }
      >
        <div style={{ height: 100 }} />
      </CustomModal>
    );
  }

  return (
    <CurriculumFormInner
      isOpen={isOpen}
      onClose={onClose}
      editingId={editingId}
      defaultValues={curriculum}
    />
  );
}

function CurriculumFormInner({
  isOpen,
  onClose,
  editingId,
  defaultValues,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingId?: string;
  defaultValues?: Curriculum;
}) {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [description, setDescription] = useState(
    defaultValues?.description ?? "",
  );
  // Topics and subtopics arrive already sorted — take them as they come.
  const [topics, setTopics] = useState<DraftTopic[]>(() => {
    if (defaultValues?.topics && defaultValues.topics.length > 0) {
      return defaultValues.topics.map((t) => ({
        _id: t._id,
        title: t.title,
        description: t.description || "",
        subtopics: (t.subtopics || []).map((s) => ({
          _id: s._id,
          title: s.title,
          description: s.description || "",
        })),
      }));
    }
    return [
      {
        title: "",
        description: "",
        subtopics: [{ title: "", description: "" }],
      },
    ];
  });

  // Drag state — one cursor for topics, one per topic for its subtopics.
  const [dragTopic, setDragTopic] = useState<number | null>(null);
  const [overTopic, setOverTopic] = useState<number | null>(null);

  const { mutate: create, isPending: creating } = useCreateCurriculum();
  const { mutate: update, isPending: updating } = useUpdateCurriculum();
  const isPending = creating || updating;

  const addTopic = () =>
    setTopics((prev) => [
      ...prev,
      { title: "", description: "", subtopics: [] },
    ]);
  const removeTopic = (ti: number) =>
    setTopics((prev) => prev.filter((_, i) => i !== ti));
  const setTopicField = (
    ti: number,
    field: "title" | "description",
    value: string,
  ) =>
    setTopics((prev) =>
      prev.map((t, i) => (i === ti ? { ...t, [field]: value } : t)),
    );

  const addSubtopic = (ti: number) =>
    setTopics((prev) =>
      prev.map((t, i) =>
        i === ti
          ? {
              ...t,
              subtopics: [
                ...t.subtopics,
                { title: "", description: "" },
              ],
            }
          : t,
      ),
    );
  const removeSubtopic = (ti: number, si: number) =>
    setTopics((prev) =>
      prev.map((t, i) =>
        i === ti
          ? { ...t, subtopics: t.subtopics.filter((_, j) => j !== si) }
          : t,
      ),
    );
  const setSubtopicField = (
    ti: number,
    si: number,
    field: "title" | "description",
    value: string,
  ) =>
    setTopics((prev) =>
      prev.map((t, i) =>
        i === ti
          ? {
              ...t,
              subtopics: t.subtopics.map((s, j) =>
                j === si ? { ...s, [field]: value } : s,
              ),
            }
          : t,
      ),
    );

  const moveTopic = (ti: number, to: number) =>
    setTopics((prev) => moveItem(prev, ti, to));

  const moveSubtopic = (ti: number, si: number, to: number) =>
    setTopics((prev) =>
      prev.map((t, i) =>
        i === ti ? { ...t, subtopics: moveItem(t.subtopics, si, to) } : t,
      ),
    );

  /** How many of the kept entries already exist server-side. */
  const existingSubtopics = topics.reduce(
    (n, t) => n + t.subtopics.filter((s) => s._id).length,
    0,
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // No `order` field: array position is authoritative, and the API
    // re-numbers to 0…n-1 anyway, so sending one only invents a value that
    // disagrees with the response.
    const payload: CreateCurriculumPayload = {
      name,
      description: description || undefined,
      topics: topics
        .filter((t) => t.title.trim())
        .map((t) => ({
          ...(t._id ? { _id: t._id } : {}),
          title: t.title,
          description: t.description || undefined,
          subtopics: t.subtopics
            .filter((s) => s.title.trim())
            .map((s) => ({
              ...(s._id ? { _id: s._id } : {}),
              title: s.title,
              description: s.description || undefined,
            })),
        })),
    };
    if (editingId) {
      update({ id: editingId, data: payload }, { onSuccess: onClose });
    } else {
      create(payload, { onSuccess: onClose });
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingId ? "Edit Curriculum" : "Add Curriculum"}
      subtitle={
        editingId
          ? "Update the curriculum topics and subtopics"
          : "Define the curriculum with topics and subtopics"
      }
      icon={<BookOpen size={16} />}
      size="large"
      footer={
        <>
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
            form="curriculum-form"
            className="modal-submit"
            disabled={isPending}
          >
            {isPending ? (
              <Spinner size={14} color="#fff" text="" />
            ) : editingId ? (
              "Save Changes"
            ) : (
              "Create Curriculum"
            )}
          </button>
        </>
      }
    >
      <form
        id="curriculum-form"
        onSubmit={handleSubmit}
        className="builder-form"
      >
        <div className="form-group">
          <label className="modal-label">
            Curriculum Name <span>*</span>
          </label>
          <input
            className="modal-input"
            placeholder="e.g. Clinical Placement Curriculum"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="modal-label">Description</label>
          <textarea
            className="modal-input"
            rows={2}
            placeholder="Short description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {editingId && existingSubtopics > 0 && (
          <div className="builder-warn">
            <AlertTriangle size={14} />
            <span>
              Reordering is safe. <b>Removing</b> a topic or subtopic is not —
              saving replaces the whole list, and students' logbook entries are
              tagged to the subtopic they were filed under. Removing one leaves
              that work without a subtopic to point at.
            </span>
          </div>
        )}

        <div className="builder-toolbar">
          <span className="modal-label">
            Topics
            <span className="builder-hint" style={{ marginLeft: 8 }}>
              order shown is the order students see
            </span>
          </span>
          <button
            type="button"
            className="builder-add-btn"
            onClick={addTopic}
          >
            <Plus size={13} /> Add Topic
          </button>
        </div>

        {topics.map((topic, ti) => (
          <div
            key={topic._id ?? ti}
            className={`builder-card${
              dragTopic === ti ? " builder-card--dragging" : ""
            }${overTopic === ti && dragTopic !== ti ? " builder-card--over" : ""}`}
            draggable={topics.length > 1}
            onDragStart={(e: DragEvent<HTMLDivElement>) => {
              setDragTopic(ti);
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", String(ti));
            }}
            onDragOver={(e: DragEvent<HTMLDivElement>) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              setOverTopic(ti);
            }}
            onDragLeave={() =>
              setOverTopic((prev) => (prev === ti ? null : prev))
            }
            onDrop={(e: DragEvent<HTMLDivElement>) => {
              e.preventDefault();
              if (dragTopic !== null && dragTopic !== ti) moveTopic(dragTopic, ti);
              setDragTopic(null);
              setOverTopic(null);
            }}
            onDragEnd={() => {
              setDragTopic(null);
              setOverTopic(null);
            }}
          >
            <div className="builder-card-head">
              <span
                className="builder-grip"
                title="Drag to reorder"
                aria-hidden="true"
              >
                <GripVertical size={14} />
              </span>
              <span className="builder-card-title">Topic {ti + 1}</span>
              {/* Dragging is mouse-only, so the same move is available here. */}
              <span className="builder-move builder-move--push">
                <button
                  type="button"
                  className="builder-move-btn"
                  onClick={() => moveTopic(ti, ti - 1)}
                  disabled={ti === 0}
                  aria-label={`Move topic ${ti + 1} up`}
                  title="Move up"
                >
                  <ChevronUp size={13} />
                </button>
                <button
                  type="button"
                  className="builder-move-btn"
                  onClick={() => moveTopic(ti, ti + 1)}
                  disabled={ti === topics.length - 1}
                  aria-label={`Move topic ${ti + 1} down`}
                  title="Move down"
                >
                  <ChevronDown size={13} />
                </button>
              </span>
              <button
                type="button"
                className="builder-remove-btn"
                onClick={() => removeTopic(ti)}
                disabled={topics.length <= 1}
                aria-label="Remove topic"
                title="Remove topic"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <input
              className="modal-input"
              placeholder="Topic title"
              value={topic.title}
              onChange={(e) => setTopicField(ti, "title", e.target.value)}
            />
            <input
              className="modal-input"
              placeholder="Topic description (optional)"
              value={topic.description}
              onChange={(e) =>
                setTopicField(ti, "description", e.target.value)
              }
            />

            <div className="builder-sublist">
              {topic.subtopics.length > 0 && (
                <span className="builder-hint">Subtopics</span>
              )}
              {topic.subtopics.map((sub, si) => (
                <div key={sub._id ?? si} className="builder-subrow">
                  <span className="builder-subnum">
                    {ti + 1}.{si + 1}
                  </span>
                  <input
                    className="modal-input"
                    placeholder="Subtopic title"
                    value={sub.title}
                    onChange={(e) =>
                      setSubtopicField(ti, si, "title", e.target.value)
                    }
                  />
                  <input
                    className="modal-input"
                    placeholder="Subtopic description"
                    value={sub.description}
                    onChange={(e) =>
                      setSubtopicField(ti, si, "description", e.target.value)
                    }
                  />
                  <span className="builder-move">
                    <button
                      type="button"
                      className="builder-move-btn"
                      onClick={() => moveSubtopic(ti, si, si - 1)}
                      disabled={si === 0}
                      aria-label="Move subtopic up"
                      title="Move up"
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      type="button"
                      className="builder-move-btn"
                      onClick={() => moveSubtopic(ti, si, si + 1)}
                      disabled={si === topic.subtopics.length - 1}
                      aria-label="Move subtopic down"
                      title="Move down"
                    >
                      <ChevronDown size={12} />
                    </button>
                  </span>
                  <button
                    type="button"
                    className="builder-remove-btn"
                    onClick={() => removeSubtopic(ti, si)}
                    aria-label="Remove subtopic"
                    title="Remove subtopic"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="builder-add-btn builder-add-btn--sub"
                onClick={() => addSubtopic(ti)}
              >
                <Plus size={12} /> Add Subtopic
              </button>
            </div>
          </div>
        ))}
      </form>
    </CustomModal>
  );
}
