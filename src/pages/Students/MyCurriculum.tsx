import { useState } from "react";
import {
  BookMarked,
  ChevronDown,
  ChevronRight,
  ListChecks,
  Layers,
} from "lucide-react";
import { useMyCurriculum } from "../../hooks/useCurriculum";
import Spinner from "../../components/ui/Spinner/Spinner";
import type { Curriculum, Topic } from "../../api/types/curriculum";

function TopicRow({ topic }: { topic: Topic }) {
  const [open, setOpen] = useState(false);
  const subtopics = [...(topic.subtopics ?? [])].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        overflow: "hidden",
        background: "var(--color-bg-primary)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 14px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          color: "var(--color-text-primary)",
        }}
      >
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--color-accent)",
            minWidth: 26,
          }}
        >
          {topic.order}.
        </span>
        <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>
          {topic.title}
        </span>
        <span
          style={{
            fontSize: 12,
            color: "var(--color-text-muted)",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <ListChecks size={13} /> {subtopics.length}
        </span>
      </button>

      {open && (
        <div style={{ padding: "0 14px 12px 40px" }}>
          {topic.description && (
            <p
              style={{
                fontSize: 13,
                color: "var(--color-text-muted)",
                margin: "0 0 10px",
              }}
            >
              {topic.description}
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {subtopics.length === 0 ? (
              <span
                style={{ fontSize: 13, color: "var(--color-text-muted)" }}
              >
                No subtopics.
              </span>
            ) : (
              subtopics.map((st, i) => (
                <div
                  key={st._id ?? i}
                  style={{
                    display: "flex",
                    gap: 8,
                    fontSize: 13,
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: "var(--color-bg-secondary)",
                  }}
                >
                  <span
                    style={{
                      color: "var(--color-text-subtle)",
                      fontWeight: 600,
                      minWidth: 30,
                    }}
                  >
                    {topic.order}.{st.order}
                  </span>
                  <div>
                    <div style={{ fontWeight: 500 }}>{st.title}</div>
                    {st.description && (
                      <div
                        style={{
                          color: "var(--color-text-muted)",
                          marginTop: 2,
                        }}
                      >
                        {st.description}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CurriculumCard({ curriculum }: { curriculum: Curriculum }) {
  const topics = [...(curriculum.topics ?? [])].sort(
    (a, b) => a.order - b.order,
  );
  const subtopicCount = topics.reduce(
    (sum, t) => sum + (t.subtopics?.length ?? 0),
    0,
  );

  return (
    <div
      style={{
        background: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border)",
        borderRadius: 16,
        padding: 20,
        marginBottom: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            background: "rgba(99,102,241,.12)",
            color: "#6366f1",
            padding: 10,
            borderRadius: 10,
          }}
        >
          <Layers size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--color-text-primary)",
            }}
          >
            {curriculum.name}
          </h3>
          {curriculum.description && (
            <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              {curriculum.description}
            </p>
          )}
        </div>
        <div style={{ textAlign: "right", fontSize: 12 }}>
          <div style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>
            {topics.length} topics
          </div>
          <div style={{ color: "var(--color-text-muted)" }}>
            {subtopicCount} subtopics
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {topics.map((t, i) => (
          <TopicRow key={t._id ?? i} topic={t} />
        ))}
      </div>
    </div>
  );
}

export default function MyCurriculum() {
  const { data, isLoading } = useMyCurriculum();
  const curricula = data?.data?.curricula ?? [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon purple">
            <BookMarked size={20} />
          </div>
          <div>
            <h2 className="page-title">My Curriculum</h2>
            <p className="page-sub">
              Topics and subtopics you are expected to cover during training
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: 60,
          }}
        >
          <Spinner size={28} color="var(--color-accent)" text="Loading curriculum…" />
        </div>
      ) : curricula.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: "var(--color-text-muted)",
          }}
        >
          <BookMarked size={40} style={{ opacity: 0.4, marginBottom: 12 }} />
          <p>No curriculum has been assigned to your batch yet.</p>
        </div>
      ) : (
        curricula.map((c) => <CurriculumCard key={c._id} curriculum={c} />)
      )}
    </div>
  );
}
