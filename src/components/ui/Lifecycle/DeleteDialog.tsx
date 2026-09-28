import { useState } from "react";
import { AlertTriangle, Ban, Trash2 } from "lucide-react";
import CustomModal from "../CustomModal/CustomModal";
import Spinner from "../Spinner/Spinner";
import {
  useDeletePreflight,
  useDeleteResource,
  useSetStatus,
} from "../../../hooks/useLifecycle";
import { LIFECYCLE, type LifecycleTarget } from "../../../helpers/lifecycle";
import type {
  DeleteResponse,
  LifecycleResource,
} from "../../../api/types/lifecycle";
import "./Lifecycle.css";

interface DeleteDialogProps {
  resource: LifecycleResource;
  /** The record to delete; null keeps the dialog closed. */
  target: LifecycleTarget | null;
  onClose: () => void;
}

/**
 * Permanent delete, done safely: it dry-runs first and shows what the server
 * found. If anything still references the record it lists the blockers and
 * offers the reversible option — deactivation — instead. Only a clean dry run
 * unlocks "Delete permanently", and a 409 from the real call (something
 * started referencing it meanwhile) lands back on the blocked view.
 */
export default function DeleteDialog({
  resource,
  target,
  onClose,
}: DeleteDialogProps) {
  const { noun } = LIFECYCLE[resource];
  const Noun = noun.charAt(0).toUpperCase() + noun.slice(1);

  const preflight = useDeletePreflight(resource, target?._id ?? null);
  const { mutate: remove, isPending: deleting } = useDeleteResource(resource);
  const { mutate: setStatus, isPending: deactivating } = useSetStatus(resource);
  /** Set when the real delete was refused — it supersedes the dry run. */
  const [refusal, setRefusal] = useState<DeleteResponse | null>(null);

  const report = refusal ?? preflight.data ?? null;
  const safe = Boolean(report?.data.wouldDelete) && !report?.data.blocked;
  const blockers = report?.data.dependencies.filter((d) => d.count > 0) ?? [];

  const handleDelete = () => {
    if (!target) return;
    remove(target._id, {
      onSuccess: (res) => {
        if (res.data.deleted) onClose();
        else setRefusal(res); // 409: now referenced — show why
      },
    });
  };

  const handleDeactivate = () => {
    if (!target) return;
    setStatus({ id: target._id, isActive: false }, { onSuccess: onClose });
  };

  return (
    <CustomModal
      isOpen={Boolean(target)}
      onClose={onClose}
      title={safe ? `Delete ${noun} permanently?` : `Can't delete this ${noun}`}
      subtitle={target?.name}
      icon={<Trash2 size={16} />}
      size="medium"
      isLoading={preflight.isLoading}
      footer={
        <>
          <button
            type="button"
            className="modal-cancel"
            onClick={onClose}
            disabled={deleting || deactivating}
          >
            {safe ? "Cancel" : "Close"}
          </button>
          {safe && (
            <button
              type="button"
              className="lc-danger-btn"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Spinner size={14} color="#fff" text="" />
              ) : (
                <>
                  <Trash2 size={14} /> Delete permanently
                </>
              )}
            </button>
          )}
          {!safe && report && target?.isActive && (
            <button
              type="button"
              className="modal-submit"
              onClick={handleDeactivate}
              disabled={deactivating}
            >
              {deactivating ? (
                <Spinner size={14} color="#fff" text="" />
              ) : (
                <>
                  <Ban size={14} /> Deactivate instead
                </>
              )}
            </button>
          )}
        </>
      }
    >
      {preflight.isError && !report && (
        <p className="lc-text">
          Couldn't check whether this {noun} can be deleted. Close and try again.
        </p>
      )}

      {report && safe && (
        <div className="lc-note lc-note--danger">
          <AlertTriangle size={16} />
          {/* The server's message already ends "This cannot be undone." */}
          <span>{report.message}</span>
        </div>
      )}

      {report && !safe && (
        <div className="lc-body">
          <p className="lc-text">{report.message}</p>

          {blockers.length > 0 && (
            <div>
              <p className="lc-label">Still referenced by</p>
              <ul className="lc-blockers">
                {blockers.map((d) => (
                  <li key={`${d.model}.${d.path}`}>
                    <span>{d.label}</span>
                    <strong>{d.count}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="lc-hint">
            {target?.isActive
              ? `${Noun}s that have been used can't be deleted. Deactivating hides it instead — and you can reactivate it at any time.`
              : `It's already inactive, which is usually all you need. To delete it, clear the references above first.`}
          </p>
        </div>
      )}
    </CustomModal>
  );
}
