import { useMemo } from "react";
import { Layers, Pencil } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { useBatchById } from "../../../hooks/useBatches";
import { useQuizzes } from "../../../hooks/useQuizzes";
import { batchQuizTitle } from "../../../helpers/batchQuiz";
import { durationLabel, formatPrice } from "../../../helpers/duration";
import { fmt } from "../../../helpers/utilities";
import type { Batch, BatchCurriculumLink } from "../../../api/types/batch";
import "./BatchViewModal.css";

interface BatchViewModalProps {
  id: string;
  onClose: () => void;
  /** Offered as a footer action; omitted = no edit button. */
  onEdit?: (batch: Batch) => void;
}

const curriculumName = (link: BatchCurriculumLink) =>
  typeof link.curriculum === "string"
    ? "Curriculum"
    : link.curriculum?.name ?? "Curriculum";

/** Read-only overview of one batch, loaded fresh with `useBatchById`. */
export default function BatchViewModal({ id, onClose, onEdit }: BatchViewModalProps) {
  const { data, isLoading, isError } = useBatchById(id);
  const batch = data?.data?.batch;
  const stats = data?.data?.studentStats;

  // Names a quiz the batch carries as a bare id.
  const { data: quizzesResp } = useQuizzes({ limit: 100 });
  const quizNames = useMemo(
    () => new Map((quizzesResp?.data ?? []).map((q) => [q._id, q.title])),
    [quizzesResp],
  );

  const supervisor = batch?.supervisor?.user;
  const createdBy =
    batch?.createdBy && typeof batch.createdBy === "object"
      ? `${batch.createdBy.firstName ?? ""} ${batch.createdBy.lastName ?? ""}`.trim()
      : "";

  return (
    <CustomModal
      isOpen
      onClose={onClose}
      title={batch?.name ?? "Batch"}
      subtitle={batch?.session}
      icon={<Layers size={16} />}
      size="large"
      isLoading={isLoading}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={onClose}>
            Close
          </button>
          {batch && onEdit && batch.status !== "archived" && (
            <button
              type="button"
              className="modal-submit"
              onClick={() => onEdit(batch)}
            >
              <Pencil size={14} /> Edit Batch
            </button>
          )}
        </>
      }
    >
      {isError && (
        <p className="bv-muted">This batch couldn't be loaded. Close and try again.</p>
      )}

      {batch && (
        <div className="bv">
          <div className="bv-status">
            <StatusBadge status={batch.status} />
          </div>

          {/* ── Students ── */}
          {stats && (
            <section>
              <h4 className="bv-heading">Students</h4>
              <div className="bv-stats">
                {(
                  [
                    ["Total", stats.total],
                    ["Placed", stats.placed],
                    ["Active", stats.active],
                    ["Completed", stats.completed],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="bv-stat">
                    <strong>{value ?? 0}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Details ── */}
          <section>
            <h4 className="bv-heading">Details</h4>
            <dl className="bv-details">
              <div>
                <dt>Duration</dt>
                <dd>
                  {batch.duration
                    ? `${durationLabel(batch.duration)} · ${formatPrice(batch.duration.price)}`
                    : "Not set"}
                </dd>
              </div>
              <div>
                <dt>Placement period</dt>
                <dd>{batch.itPeriod?.name || "—"}</dd>
              </div>
              <div>
                <dt>Dates</dt>
                <dd>
                  {fmt(batch.itPeriod?.startDate ?? null)} →{" "}
                  {fmt(batch.itPeriod?.endDate ?? null)}
                </dd>
              </div>
              <div>
                <dt>Length</dt>
                <dd>
                  {batch.itPeriod?.duration
                    ? `${batch.itPeriod.duration} week${batch.itPeriod.duration === 1 ? "" : "s"}`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt>Supervisor</dt>
                <dd>
                  {supervisor ? (
                    <>
                      {supervisor.firstName} {supervisor.lastName}
                      <span className="bv-sub">{supervisor.email}</span>
                    </>
                  ) : (
                    "Not assigned"
                  )}
                </dd>
              </div>
              <div>
                <dt>Quiz</dt>
                <dd>{batchQuizTitle(batch, quizNames) ?? "Not assigned"}</dd>
              </div>
              {(batch.createdAt || createdBy) && (
                <div>
                  <dt>Created</dt>
                  <dd>
                    {fmt(batch.createdAt ?? null)}
                    {createdBy && <span className="bv-sub">by {createdBy}</span>}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {/* ── Curricula (in the order students take them) ── */}
          <section>
            <h4 className="bv-heading">
              Curricula <span>({batch.curricula?.length ?? 0})</span>
            </h4>
            {batch.curricula?.length ? (
              <ol className="bv-curricula">
                {batch.curricula.map((link, i) => (
                  <li key={link._id}>
                    <span className="bv-num">{i + 1}</span>
                    {curriculumName(link)}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="bv-muted">No curriculum is linked to this batch yet.</p>
            )}
          </section>
        </div>
      )}
    </CustomModal>
  );
}
