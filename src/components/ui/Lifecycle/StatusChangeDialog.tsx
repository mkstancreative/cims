import ConfirmModal from "../ConfirmModal/ConfirmModal";
import { useSetStatus } from "../../../hooks/useLifecycle";
import { LIFECYCLE, type LifecycleTarget } from "../../../helpers/lifecycle";
import type { LifecycleResource } from "../../../api/types/lifecycle";

interface StatusChangeDialogProps {
  resource: LifecycleResource;
  /** The record to flip; null keeps the dialog closed. */
  target: LifecycleTarget | null;
  onClose: () => void;
}

/**
 * Confirms an activate / deactivate — the everyday, reversible control —
 * spelling out what it does to people downstream for this resource.
 */
export default function StatusChangeDialog({
  resource,
  target,
  onClose,
}: StatusChangeDialogProps) {
  const { noun, deactivateEffect, activateEffect } = LIFECYCLE[resource];
  const { mutate: setStatus, isPending } = useSetStatus(resource);

  const deactivating = target?.isActive ?? true;
  const Noun = noun.charAt(0).toUpperCase() + noun.slice(1);

  return (
    <ConfirmModal
      isOpen={Boolean(target)}
      variant={deactivating ? "warning" : "success"}
      title={`${deactivating ? "Deactivate" : "Activate"} ${Noun}`}
      message={
        target
          ? `${deactivating ? "Deactivate" : "Activate"} "${target.name}"? ${
              deactivating ? deactivateEffect : activateEffect
            }`
          : ""
      }
      confirmText={deactivating ? "Yes, Deactivate" : "Yes, Activate"}
      cancelText="Cancel"
      isPending={isPending}
      onConfirm={() => {
        if (!target) return;
        // The target state, not a flip — idempotent if clicked twice.
        setStatus(
          { id: target._id, isActive: !target.isActive },
          { onSuccess: onClose },
        );
      }}
      onCancel={onClose}
    />
  );
}
