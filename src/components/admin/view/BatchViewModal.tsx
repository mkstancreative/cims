import { useMemo } from "react";
import {
  Layers,
  Mail,
  Pencil,
  Phone,
  UserPlus,
  UserRound,
  UserX,
} from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { useBatchById } from "../../../hooks/useBatches";
import { useQuizzes } from "../../../hooks/useQuizzes";
import { batchQuizTitle } from "../../../helpers/batchQuiz";
import {
  supervisorInactive,
  supervisorName,
  supervisorPhone,
} from "../../../helpers/batchSupervisor";
import { durationLabel, formatPrice } from "../../../helpers/duration";
import { fmt } from "../../../helpers/utilities";
import type { Batch, BatchCurriculumLink } from "../../../api/types/batch";
import "./BatchViewModal.css";

interface BatchViewModalProps {
  id: string;
  onClose: () => void;
  /** Offered as a footer action; omitted = no edit button. */
  onEdit?: (batch: Batch) => void;
  /** Opens assignment — offered when unassigned or the supervisor is inactive. */
  onAssignSupervisor?: (batch: Batch) => void;
}

const curriculumName = (link: BatchCurriculumLink) =>
  typeof link.curriculum === "string"
    ? "Curriculum"
    : link.curriculum?.name ?? "Curriculum";

/** Read-only overview of one batch, loaded fresh with `useBatchById`. */
export default function BatchViewModal({
  id,
  onClose,
  onEdit,
  onAssignSupervisor,
}: BatchViewModalProps) {
  const { data, isLoading, isError } = useBatchById(id);
  const batch = data?.data?.batch;
  const stats = data?.data?.studentStats;

  // Names a quiz the batch carries as a bare id.
  const { data: quizzesResp } = useQuizzes({ limit: 100 });
  const quizNames = useMemo(
    () => new Map((quizzesResp?.data ?? []).map((q) => [q._id, q.title])),
    [quizzesResp],
  );

  const sup = batch?.supervisor ?? null;
  const supName = supervisorName(sup);
  const supPhone = supervisorPhone(sup);
  const supInactive = supervisorInactive(sup);
  const canAssign = Boolean(batch && onAssignSupervisor && batch.status !== "archived");
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
                    // Earlier cycles closed when the student's newer
                    // internship started.
                    ["Abandoned", stats.abandoned],
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

          {/* ── Supervisor ── */}
          <section>
            <h4 className="bv-heading">Supervisor</h4>
            {!supName ? (
              <div className="bv-sup bv-sup--none">
                <UserX size={18} />
                <div className="bv-sup__body">
                  <strong>No supervisor assigned</strong>
                  <span>Nobody is reviewing these students' logbooks yet.</span>
                </div>
                {canAssign && (
                  <button
                    type="button"
                    className="bv-sup__action"
                    onClick={() => onAssignSupervisor!(batch)}
                  >
                    <UserPlus size={14} /> Assign supervisor
                  </button>
                )}
              </div>
            ) : (
              <div className={`bv-sup${supInactive ? " bv-sup--inactive" : ""}`}>
                <UserRound size={18} />
                <div className="bv-sup__body">
                  <strong>
                    {supName}
                    {supInactive && (
                      <StatusBadge status="deactivated" className="bv-sup__flag" />
                    )}
                  </strong>
                  {(sup?.specialization || sup?.staffId) && (
                    <span>
                      {[sup?.specialization, sup?.staffId].filter(Boolean).join(" · ")}
                    </span>
                  )}
                  <span className="bv-sup__contact">
                    {sup?.user?.email && (
                      <a href={`mailto:${sup.user.email}`}>
                        <Mail size={13} /> {sup.user.email}
                      </a>
                    )}
                    {supPhone && (
                      <a href={`tel:${supPhone}`}>
                        <Phone size={13} /> {supPhone}
                      </a>
                    )}
                  </span>
                  {supInactive && (
                    <span className="bv-sup__warn">
                      This supervisor's account is deactivated, so nobody is
                      currently covering this batch.
                    </span>
                  )}
                </div>
                {canAssign && (
                  <button
                    type="button"
                    className={`bv-sup__action${supInactive ? "" : " bv-sup__action--quiet"}`}
                    onClick={() => onAssignSupervisor!(batch)}
                  >
                    <UserPlus size={14} />{" "}
                    {supInactive ? "Reassign supervisor" : "Reassign"}
                  </button>
                )}
              </div>
            )}
          </section>

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
