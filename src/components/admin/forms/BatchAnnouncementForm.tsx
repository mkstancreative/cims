import { useState, type FormEvent } from "react";
import { Megaphone, Send } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import {
  useSendBatchAnnouncement,
  useBatchAnnouncements,
} from "../../../hooks/useNotifications";
import type {
  AnnouncementAudience,
  NotificationType,
} from "../../../api/types/notifications";
import type { Batch } from "../../../api/types/batch";
import { formatDateTime } from "../../../helpers/utilities";
import "./BatchForm.css";
import "./BatchAnnouncementForm.css";

interface BatchAnnouncementFormProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch;
}

const TITLE_MAX = 150;
const MESSAGE_MAX = 1000;

export default function BatchAnnouncementForm({
  isOpen,
  onClose,
  batch,
}: BatchAnnouncementFormProps) {
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "info" as NotificationType,
    actionUrl: "",
    audience: "all" as AnnouncementAudience,
  });

  const { mutate: send, isPending } = useSendBatchAnnouncement();
  const { data: history, isLoading: loadingHistory } = useBatchAnnouncements(
    batch._id,
  );

  const set = <K extends keyof typeof form>(
    field: K,
    value: (typeof form)[K],
  ) => setForm((prev) => ({ ...prev, [field]: value }));

  const canSubmit =
    form.title.trim().length >= 3 &&
    form.title.trim().length <= TITLE_MAX &&
    form.message.trim().length >= 3 &&
    form.message.trim().length <= MESSAGE_MAX;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    send(
      {
        id: batch._id,
        data: {
          title: form.title.trim(),
          message: form.message.trim(),
          type: form.type,
          audience: form.audience,
          ...(form.actionUrl.trim()
            ? { actionUrl: form.actionUrl.trim() }
            : {}),
        },
      },
      {
        onSuccess: () =>
          setForm((prev) => ({ ...prev, title: "", message: "", actionUrl: "" })),
      },
    );
  };

  const sends = history?.data ?? [];

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Batch Announcement"
      subtitle={`Send a notification to the students in ${batch.name}`}
      icon={<Megaphone size={16} />}
      size="large"
      footer={
        <>
          <button
            type="button"
            className="modal-cancel"
            onClick={onClose}
            disabled={isPending}
          >
            Close
          </button>
          <button
            type="submit"
            form="batch-announcement-form"
            className="modal-submit"
            disabled={isPending || !canSubmit}
          >
            {isPending ? (
              <Spinner size={14} color="#fff" text="" />
            ) : (
              <>
                <Send size={14} style={{ marginRight: 6 }} />
                Send
              </>
            )}
          </button>
        </>
      }
    >
      <form
        id="batch-announcement-form"
        onSubmit={handleSubmit}
        className="form-grid"
      >
        <div className="form-group col-1">
          <label className="modal-label">
            Title <span>*</span>
          </label>
          <input
            className="modal-input"
            placeholder="e.g. Orientation"
            maxLength={TITLE_MAX}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
          />
          <span className="bf-hint">
            {form.title.length}/{TITLE_MAX} · minimum 3 characters
          </span>
        </div>

        <div className="form-group col-1">
          <label className="modal-label">
            Message <span>*</span>
          </label>
          <textarea
            className="modal-input"
            rows={4}
            placeholder="e.g. Report to the training hall at 8am on Monday."
            maxLength={MESSAGE_MAX}
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            required
          />
          <span className="bf-hint">
            {form.message.length}/{MESSAGE_MAX} · minimum 3 characters
          </span>
        </div>

        <div className="form-group col-2">
          <label className="modal-label">Type</label>
          <select
            className="modal-input"
            value={form.type}
            onChange={(e) => set("type", e.target.value as NotificationType)}
          >
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div className="form-group col-2">
          <label className="modal-label">Audience</label>
          <select
            className="modal-input"
            value={form.audience}
            onChange={(e) =>
              set("audience", e.target.value as AnnouncementAudience)
            }
          >
            <option value="all">All students in the batch</option>
            <option value="placed">Placed students only</option>
            <option value="active">Active students only</option>
          </select>
          <span className="bf-hint">
            Nothing is sent if no student matches the audience.
          </span>
        </div>

        <div className="form-group col-1">
          <label className="modal-label">Action link</label>
          <input
            className="modal-input"
            placeholder="e.g. /student/quiz"
            value={form.actionUrl}
            onChange={(e) => set("actionUrl", e.target.value)}
          />
          <span className="bf-hint">
            Optional deep link opened when the student taps the notification.
          </span>
        </div>
      </form>

      {/* ── Sent history — one row per send, not per recipient ── */}
      <div className="ba-history">
        <div className="section-title-divider">Sent history</div>

        {loadingHistory ? (
          <div className="ba-empty">Loading…</div>
        ) : sends.length === 0 ? (
          <div className="ba-empty">
            No announcements have been sent to this batch yet.
          </div>
        ) : (
          sends.map((item) => (
            <div key={item.broadcastId} className="ba-row">
              <div className="ba-row-head">
                <span className={`ba-type ba-type--${item.type}`}>
                  {item.type}
                </span>
                <span className="ba-title">{item.title}</span>
                <span className="ba-read">
                  {item.readCount}/{item.recipients} read
                </span>
              </div>
              <p className="ba-message">{item.message}</p>
              <div className="ba-meta">
                {formatDateTime(item.sentAt)}
                {item.sentBy
                  ? ` · ${[item.sentBy.firstName, item.sentBy.lastName]
                      .filter(Boolean)
                      .join(" ")}`
                  : ""}
                {item.actionUrl ? ` · ${item.actionUrl}` : ""}
              </div>
            </div>
          ))
        )}
      </div>
    </CustomModal>
  );
}
