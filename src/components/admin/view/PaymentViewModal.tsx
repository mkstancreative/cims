import { ExternalLink, Receipt, RefreshCw } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { usePayment, useReverifyPayment } from "../../../hooks/usePayments";
import { formatDateTime } from "../../../helpers/utilities";
import {
  formatAmount,
  payerName,
  payerRegNumber,
  institutionName,
  canReverify,
} from "../../../helpers/payment";
import type { PaymentAttempt } from "../../../api/types/payment";
import "./PaymentView.css";

interface PaymentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="payment-row">
      <span className="payment-row-label">{label}</span>
      <span className="payment-row-value">{value}</span>
    </div>
  );
}

export default function PaymentViewModal({
  isOpen,
  onClose,
  id,
}: PaymentViewModalProps) {
  const { data, isLoading } = usePayment(id);
  const { mutate: reverify, isPending: reverifying } = useReverifyPayment();

  const payment = data?.data?.payment;
  const attempts: PaymentAttempt[] = data?.data?.attempts ?? [];

  // Resolve nested registration fields
  const reg =
    payment?.registration &&
    typeof payment.registration === "object"
      ? payment.registration
      : null;

  // Resolve nested student fields from the payment record directly
  const student =
    payment?.student && typeof payment.student === "object"
      ? payment.student
      : null;

  const studentUser =
    student && "user" in student && typeof student.user === "object"
      ? student.user
      : null;

  // Department from student
  const department =
    student && "department" in student && student.department
      ? (student.department as { name: string; code: string })
      : null;

  // Program label
  const program = payment?.program ?? (reg && "program" in reg ? reg.program : null);
  const programLabel = program
    ? `${program.type} – ${program.level}`
    : "—";

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment Details"
      subtitle={payment?.reference}
      icon={<Receipt size={16} />}
      size="medium"
      isLoading={isLoading}
      footer={
        payment ? (
          <>
            <button type="button" className="modal-cancel" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="modal-submit"
              onClick={() => reverify(payment._id)}
              disabled={reverifying || !canReverify(payment)}
            >
              {reverifying ? (
                <Spinner size={14} color="#fff" text="" />
              ) : (
                <span className="payment-reverify-label">
                  <RefreshCw size={13} /> Re-verify
                </span>
              )}
            </button>
          </>
        ) : undefined
      }
    >
      {payment && (
        <div className="payment-detail">
          {/* ── Amount + Status ── */}
          <div className="payment-amount-block">
            <span className="payment-amount">
              {formatAmount(payment.amount, payment.currency)}
            </span>
            <StatusBadge status={payment.status} />
          </div>

          {/* ── Transaction ── */}
          <div className="payment-section">
            <div className="payment-section-title">Transaction</div>
            <Row
              label="Reference"
              value={
                <span style={{ fontFamily: "monospace" }}>
                  {payment.reference}
                </span>
              }
            />
            {payment.credoReference && (
              <Row
                label="Credo Ref."
                value={
                  <span style={{ fontFamily: "monospace" }}>
                    {payment.credoReference}
                  </span>
                }
              />
            )}
            <Row label="Attempt #" value={payment.attemptNumber ?? "—"} />
            <Row label="Reg. Type" value={payment.registrationType ?? "—"} />
            <Row label="Channel" value={payment.channel ?? "—"} />
            <Row label="Provider" value={payment.provider ?? "—"} />
            <Row label="Purpose" value={payment.purpose ?? "—"} />
            <Row
              label="Paid At"
              value={payment.paidAt ? formatDateTime(payment.paidAt) : "—"}
            />
            <Row
              label="Verified At"
              value={
                payment.verifiedAt ? formatDateTime(payment.verifiedAt) : "—"
              }
            />
            <Row label="Created" value={formatDateTime(payment.createdAt)} />
            {payment.authorizationUrl && (
              <Row
                label="Pay URL"
                value={
                  <a
                    href={payment.authorizationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="payment-auth-link"
                  >
                    Open <ExternalLink size={11} style={{ marginLeft: 3 }} />
                  </a>
                }
              />
            )}
          </div>

          {/* ── Payer ── */}
          <div className="payment-section">
            <div className="payment-section-title">Payer</div>
            <Row
              label="Name"
              value={
                studentUser
                  ? `${studentUser.firstName} ${studentUser.lastName}`
                  : payerName(payment)
              }
            />
            <Row
              label="Email"
              value={studentUser?.email ?? "—"}
            />
            <Row
              label="Phone"
              value={studentUser?.phone ?? "—"}
            />
            <Row
              label="Reg. Number"
              value={
                (student && "registrationNumber" in student
                  ? student.registrationNumber
                  : undefined) ?? payerRegNumber(payment)
              }
            />
            {department && (
              <Row
                label="Department"
                value={`${department.name} (${department.code})`}
              />
            )}
            <Row label="Institution" value={institutionName(payment)} />
          </div>

          {/* ── Registration ── */}
          {reg && (
            <div className="payment-section">
              <div className="payment-section-title">Registration</div>
              <Row label="Program" value={programLabel} />
              {reg.type && <Row label="Type" value={reg.type} />}
              {reg.status && (
                <Row
                  label="Status"
                  value={<StatusBadge status={reg.status} />}
                />
              )}
              {reg.isOpen !== undefined && (
                <Row
                  label="Open"
                  value={reg.isOpen ? "Yes" : "No"}
                />
              )}
              {reg.createdAt && (
                <Row
                  label="Created"
                  value={formatDateTime(reg.createdAt)}
                />
              )}
            </div>
          )}

          {/* ── Attempt History ── */}
          {attempts.length > 0 && (
            <div className="payment-section">
              <div className="payment-section-title">
                Attempt History ({attempts.length})
              </div>
              <div className="payment-attempts-table-wrap">
                <table className="payment-attempts-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Reference</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((a) => (
                      <tr key={a._id} data-status={a.status}>
                        <td>{a.attemptNumber}</td>
                        <td>
                          <span className="payment-attempt-ref">
                            {a.reference}
                          </span>
                        </td>
                        <td>{formatAmount(a.amount, payment.currency)}</td>
                        <td>
                          <StatusBadge status={a.status} />
                        </td>
                        <td className="payment-attempt-date">
                          {formatDateTime(a.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!canReverify(payment) && (
            <p className="payment-note">
              This payment is already settled — re-verification is unavailable.
            </p>
          )}
        </div>
      )}
    </CustomModal>
  );
}
