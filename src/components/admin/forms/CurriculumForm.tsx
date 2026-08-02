import { useState, type FormEvent } from "react";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { useCreateCurriculum } from "../../../hooks/useCurriculum";
import type { CreateCurriculumPayload } from "../../../api/types/curriculum";
import "./BuilderForm.css";

// ── Builder types (local, order is derived on submit) ─────────────────────────
interface DraftSubtopic {
  title: string;
  description: string;
}
interface DraftTopic {
  title: string;
  description: string;
  subtopics: DraftSubtopic[];
}

interface CurriculumFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CurriculumForm({ isOpen, onClose }: CurriculumFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [topics, setTopics] = useState<DraftTopic[]>([
    { title: "", description: "", subtopics: [{ title: "", description: "" }] },
  ]);
  const { mutate: create, isPending } = useCreateCurriculum();

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
          ? { ...t, subtopics: [...t.subtopics, { title: "", description: "" }] }
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload: CreateCurriculumPayload = {
      name,
      description: description || undefined,
      topics: topics
        .filter((t) => t.title.trim())
        .map((t, ti) => ({
          title: t.title,
          description: t.description || undefined,
          order: ti + 1,
          subtopics: t.subtopics
            .filter((s) => s.title.trim())
            .map((s, si) => ({
              title: s.title,
              description: s.description || undefined,
              order: si + 1,
            })),
        })),
    };
    create(payload, { onSuccess: onClose });
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Curriculum"
      subtitle="Define the curriculum with topics and subtopics"
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
            ) : (
              "Create Curriculum"
            )}
          </button>
        </>
      }
    >
      <form id="curriculum-form" onSubmit={handleSubmit} className="builder-form">
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

        <div className="builder-toolbar">
          <span className="modal-label">Topics</span>
          <button type="button" className="builder-add-btn" onClick={addTopic}>
            <Plus size={13} /> Add Topic
          </button>
        </div>

        {topics.map((topic, ti) => (
          <div key={ti} className="builder-card">
            <div className="builder-card-head">
              <span className="builder-card-title">Topic {ti + 1}</span>
              <button
                type="button"
                className="builder-remove-btn builder-remove-btn--push"
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
              onChange={(e) => setTopicField(ti, "description", e.target.value)}
            />

            <div className="builder-sublist">
              {topic.subtopics.length > 0 && (
                <span className="builder-hint">Subtopics</span>
              )}
              {topic.subtopics.map((sub, si) => (
                <div key={si} className="builder-subrow">
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
