import { Layers } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import { useCurriculum } from "../../../hooks/useCurriculum";

interface CurriculumViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
}

export default function CurriculumViewModal({
  isOpen,
  onClose,
  id,
}: CurriculumViewModalProps) {
  const { data, isLoading } = useCurriculum(id);
  const curriculum = data?.data;

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={curriculum?.name ?? "Curriculum"}
      subtitle={curriculum?.description}
      icon={<Layers size={16} />}
      size="large"
      isLoading={isLoading}
    >
      {curriculum && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {(curriculum.topics ?? []).length === 0 && (
            <p style={{ color: "var(--color-text-secondary)" }}>
              No topics defined.
            </p>
          )}
          {[...(curriculum.topics ?? [])]
            .sort((a, b) => a.order - b.order)
            .map((topic) => (
              <div
                key={topic._id ?? topic.order}
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  {topic.order}. {topic.title}
                </div>
                {topic.description && (
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--color-text-secondary)",
                      marginTop: 2,
                    }}
                  >
                    {topic.description}
                  </div>
                )}
                <ul style={{ margin: "10px 0 0", paddingLeft: 18 }}>
                  {[...(topic.subtopics ?? [])]
                    .sort((a, b) => a.order - b.order)
                    .map((sub) => (
                      <li
                        key={sub._id ?? sub.order}
                        style={{ fontSize: 13, marginBottom: 4 }}
                      >
                        <span style={{ fontWeight: 600 }}>{sub.title}</span>
                        {sub.description && (
                          <span style={{ color: "var(--color-text-secondary)" }}>
                            {" "}
                            — {sub.description}
                          </span>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
        </div>
      )}
    </CustomModal>
  );
}
