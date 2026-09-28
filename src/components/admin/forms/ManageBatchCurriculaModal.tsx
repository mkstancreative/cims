import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, Info, Plus, Trash2 } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import ConfirmModal from "../../ui/ConfirmModal/ConfirmModal";
import { ReorderableList } from "../../ui/ReorderableList/ReorderableList";
import {
  useBatchById,
  useLinkBatchCurriculum,
  useReorderBatchCurricula,
  useUnlinkBatchCurriculum,
} from "../../../hooks/useBatches";
import { useCurricula } from "../../../hooks/useCurriculum";
import type {
  Batch,
  BatchCurriculumLink,
  BatchDetailResponse,
} from "../../../api/types/batch";
import "./BuilderForm.css";

interface ManageBatchCurriculaModalProps {
  batch: Batch;
  onClose: () => void;
}

function refId(ref: BatchCurriculumLink["curriculum"]): string {
  return typeof ref === "string" ? ref : (ref?._id ?? "");
}

/**
 * The link's `curriculum` may arrive populated or as a bare id, so fall back
 * to the active-curricula list we already have loaded before giving up.
 */
function refName(
  ref: BatchCurriculumLink["curriculum"],
  lookup: Map<string, string>,
): string {
  if (ref && typeof ref === "object") return ref.name ?? "Curriculum";
  return lookup.get(ref) ?? "Curriculum";
}

/**
 * Order decides which curriculum a student is shown first, so it is worth a
 * surface of its own rather than a fire-and-forget "link" action.
 */
export default function ManageBatchCurriculaModal({
  batch,
  onClose,
}: ManageBatchCurriculaModalProps) {
  const queryClient = useQueryClient();
  const { data: detail, isLoading } = useBatchById(batch._id);
  const { data: available, isLoading: loadingCurricula } = useCurricula({
    limit: 100,
    isActive: true,
  });

  const { mutate: link, isPending: linking } = useLinkBatchCurriculum();
  const { mutate: unlink, isPending: unlinking } = useUnlinkBatchCurriculum();
  const { mutateAsync: reorder, isPending: reordering } =
    useReorderBatchCurricula();

  const [curriculumId, setCurriculumId] = useState("");
  /** "" means append; otherwise a zero-based insert position. */
  const [insertAt, setInsertAt] = useState("");
  const [removeTarget, setRemoveTarget] = useState<BatchCurriculumLink | null>(
    null,
  );
  // Every add / reorder / remove response is already sorted and gap-free, so
  // the array arrives in display order — no client-side sort.
  const links: BatchCurriculumLink[] = detail?.data?.batch?.curricula ?? [];

  const linkedIds = new Set(links.map((l) => refId(l.curriculum)));
  const options = (available?.data ?? []).filter((c) => !linkedIds.has(c._id));
  const names = new Map((available?.data ?? []).map((c) => [c._id, c.name]));

  // Add / remove / reorder never overlap: each one changes the list the
  // others are computed from.
  const busy = linking || unlinking || reordering;

  /**
   * Saves the new order, then rewrites the cache from the server's
   * `data.curricula` (ids only — reconciled against the rows we hold), so the
   * list lands on the confirmed order with no flicker. A rejection makes the
   * list roll the drop back.
   */
  const saveOrder = async (next: BatchCurriculumLink[]) => {
    const res = await reorder({
      id: batch._id,
      curriculumIds: next.map((l) => refId(l.curriculum)),
    });
    const byId = new Map(next.map((l) => [refId(l.curriculum), l]));
    const confirmed = res.data.curricula
      .map((row) => byId.get(row.curriculum))
      .filter((l): l is BatchCurriculumLink => Boolean(l))
      .map((l, order) => ({ ...l, order }));
    queryClient.setQueryData<BatchDetailResponse>(["batches", batch._id], (old) =>
      old
        ? {
            ...old,
            data: {
              ...old.data,
              batch: { ...old.data.batch, curricula: confirmed },
            },
          }
        : old,
    );
  };

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!curriculumId) return;
    link(
      {
        id: batch._id,
        curriculumId,
        // Omitted entirely when appending — the API's own default.
        ...(insertAt === "" ? {} : { order: Number(insertAt) }),
      },
      {
        onSuccess: () => {
          setCurriculumId("");
          setInsertAt("");
        },
      },
    );
  };

  return (
    <>
      <CustomModal
        isOpen
        onClose={onClose}
        title="Batch Curricula"
        subtitle={`Order the curricula for ${batch.name}`}
        icon={<BookOpen size={16} />}
        size="large"
        isLoading={isLoading}
        footer={
          <button type="button" className="modal-cancel" onClick={onClose}>
            Close
          </button>
        }
      >
        <div className="builder-form">
          <div
            className="builder-warn"
            style={{
              background: "var(--color-accent-muted)",
              color: "var(--color-text-secondary)",
            }}
          >
            <Info size={14} />
            <span>
              Students work through these in the order shown — the first one is
              what they see first. Drag a row, or use the arrows.
            </span>
          </div>

          {/* ── Ordered list ── */}
          {links.length === 0 ? (
            <p
              style={{
                color: "var(--color-text-muted)",
                fontSize: 13,
                margin: 0,
              }}
            >
              No curriculum is linked to this batch yet.
            </p>
          ) : (
            <ReorderableList<BatchCurriculumLink>
              items={links}
              getId={(l) => l._id}
              getLabel={(l) => refName(l.curriculum, names)}
              // The list locks itself during its own save.
              disabled={linking || unlinking}
              onReorder={saveOrder}
              renderItem={(l) => (
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>
                  {refName(l.curriculum, names)}
                </span>
              )}
              renderActions={(l) => (
                <button
                  type="button"
                  className="builder-remove-btn"
                  onClick={() => setRemoveTarget(l)}
                  disabled={busy}
                  aria-label={`Unlink ${refName(l.curriculum, names)}`}
                  title="Unlink curriculum"
                >
                  <Trash2 size={13} />
                </button>
              )}
            />
          )}

          {/* ── Add ── */}
          <form
            onSubmit={handleAdd}
            className="form-grid"
            style={{ marginTop: 4 }}
          >
            <div className="section-title-divider">Add a curriculum</div>

            <div className="form-group col-2">
              <label className="modal-label">Curriculum</label>
              <select
                className="modal-input"
                value={curriculumId}
                onChange={(e) => setCurriculumId(e.target.value)}
                disabled={loadingCurricula || busy}
              >
                <option value="">
                  {loadingCurricula
                    ? "Loading…"
                    : options.length === 0
                      ? "All active curricula are already linked"
                      : "Select a curriculum"}
                </option>
                {options.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group col-2">
              <label className="modal-label">Position</label>
              <select
                className="modal-input"
                value={insertAt}
                onChange={(e) => setInsertAt(e.target.value)}
                disabled={busy}
              >
                <option value="">At the end</option>
                {links.map((_, i) => (
                  <option key={i} value={i}>
                    Position {i + 1}
                    {i === 0 ? " (first)" : ""}
                  </option>
                ))}
              </select>
              <span className="builder-hint">
                Inserting pushes everything below it down one.
              </span>
            </div>

            <div className="form-group col-1">
              <button
                type="submit"
                className="builder-add-btn"
                disabled={busy || !curriculumId}
              >
                {linking ? (
                  <Spinner size={13} color="var(--color-accent)" text="" />
                ) : (
                  <>
                    <Plus size={13} /> Add to batch
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </CustomModal>

      <ConfirmModal
        isOpen={Boolean(removeTarget)}
        variant="danger"
        title="Unlink Curriculum"
        message={
          removeTarget
            ? `Remove "${refName(removeTarget.curriculum, names)}" from ${batch.name}? Students in this batch will no longer see it.`
            : ""
        }
        confirmText="Yes, Unlink"
        cancelText="Cancel"
        isPending={unlinking}
        onConfirm={() => {
          if (!removeTarget) return;
          unlink(
            {
              id: batch._id,
              curriculumId: refId(removeTarget.curriculum),
            },
            { onSuccess: () => setRemoveTarget(null) },
          );
        }}
        onCancel={() => setRemoveTarget(null)}
      />
    </>
  );
}
