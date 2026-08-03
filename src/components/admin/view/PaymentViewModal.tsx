import { Receipt, RefreshCw } from "lucide-react";
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
  const payment = data?.data;

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
          <div className="payment-amount-block">
            <span className="payment-amount">
              {formatAmount(payment.amount, payment.currency)}
            </span>
            <StatusBadge status={payment.status} />
          </div>

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
          </div>

          <div className="payment-section">
            <div className="payment-section-title">Payer</div>
            <Row label="Name" value={payerName(payment)} />
            <Row label="Reg. Number" value={payerRegNumber(payment)} />
            <Row label="Institution" value={institutionName(payment)} />
          </div>

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
