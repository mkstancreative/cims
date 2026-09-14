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
          {/* Already sorted by the API — render as it comes. The visible
              number is the array position, because `order` is zero-based. */}
          {(curriculum.topics ?? []).map((topic, ti) => (
              <div
                key={topic._id ?? ti}
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  {ti + 1}. {topic.title}
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
                  {(topic.subtopics ?? []).map((sub, si) => (
                      <li
                        key={sub._id ?? si}
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
