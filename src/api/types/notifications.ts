export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * What triggered the notification. Drives the inbox icon, grouping and the
 * `category` filter. Automatic events fire across the student journey;
 * `batch_announcement` is the one an admin composes by hand.
 */
export type NotificationCategory =
  | 'payment_confirmed'
  | 'enrolled'
  | 'batch_activated'
  | 'it_started'
  | 'supervisor_assigned'
  | 'quiz_unlocked'
  | 'grade_ready'
  | 'certificate_ready'
  | 'certificate_rejected'
  | 'batch_announcement';

export interface NotificationSender {
  _id?: string;
  firstName?: string;
  lastName?: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
  /** All four are nullable — they are absent on pre-feature notifications. */
  category?: NotificationCategory | null;
  /** Set when this copy came from a batch-wide send. */
  batch?: string | { _id: string; name?: string } | null;
  /** Shared by every copy of one send. */
  broadcastId?: string | null;
  /** Who sent it — `null` for automatic events. */
  sentBy?: NotificationSender | string | null;
  actionUrl?: string | null;
}

export interface NotificationPayload {
  title: string;
  message: string;
  type: NotificationType;
  userId?: string;
}

export interface NotificationParams {
  page?: number;
  limit?: number;
  type?: NotificationType | '';
  isRead?: boolean;
  category?: NotificationCategory | '';
}

// ─── Batch announcements ──────────────────────────────────────────────────────

/** Who in the batch receives the announcement. */
export type AnnouncementAudience = 'all' | 'placed' | 'active';

export interface BatchAnnouncementPayload {
  id: string;
  data: {
    /** 3–150 chars. */
    title: string;
    /** 3–1000 chars. */
    message: string;
    type: NotificationType;
    /** Optional deep link, e.g. "/student/quiz". */
    actionUrl?: string;
    audience: AnnouncementAudience;
  };
}

export interface BatchAnnouncementResponse {
  success: boolean;
  message?: string;
  data: {
    recipients: number;
    broadcastId: string;
  };
}

/** One row per send — not per recipient. */
export interface BatchAnnouncement {
  broadcastId: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  actionUrl?: string | null;
  sentBy?: NotificationSender | null;
  sentAt: string;
  recipients: number;
  readCount: number;
}

export interface BatchAnnouncementListResponse {
  success: boolean;
  data: BatchAnnouncement[];
}

/**
 * A socket payload. A batch broadcast is one emit to everyone, so it cannot
 * carry each recipient's own notification `_id`: it arrives as a lighter
 * envelope with `unreadHint` and no `_id`. On a payload without `_id`,
 * refetch the list rather than pushing it in — otherwise "mark as read" has
 * nothing to act on.
 */
export type NotificationSocketPayload =
  | Notification
  | {
      broadcastId: string;
      batch: string;
      title: string;
      message: string;
      type: NotificationType;
      category: NotificationCategory;
      unreadHint: true;
      timestamp: string;
    };

export function isBroadcastEnvelope(
  payload: NotificationSocketPayload,
): payload is Exclude<NotificationSocketPayload, Notification> {
  return !('_id' in payload) || !payload._id;
}
