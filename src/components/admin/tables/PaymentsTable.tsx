import { Eye, RefreshCw } from "lucide-react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import ActionDropDown from "../../ui/ActionDropdown/ActionDropDown";
import { usePayments, useReverifyPayment } from "../../../hooks/usePayments";
import { formatDateTime } from "../../../helpers/utilities";
import {
  formatAmount,
  payerName,
  payerRegNumber,
  canReverify,
} from "../../../helpers/payment";
import type { Payment, PaymentParams } from "../../../api/types/payment";

interface PaymentsTableProps {
  params: PaymentParams;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onView: (payment: Payment) => void;
}

export default function PaymentsTable({
  params,
  onPageChange,
  onLimitChange,
  onView,
}: PaymentsTableProps) {
  const { data, isLoading } = usePayments(params);
  const { mutate: reverify, isPending: reverifying } = useReverifyPayment();

  const payments: Payment[] = data?.data ?? [];

  const meta: TableMeta | null = data
    ? {
        page: data.page,
        pages: data.pages,
        count: data.total,
        limit: params.limit ?? 10,
        hasPrev: data.page > 1,
        hasNext: data.page < data.pages,
      }
    : null;

  const columns: Column<Payment>[] = [
    {
      header: "Reference",
      render: (row) => (
        <span style={{ fontFamily: "monospace", fontSize: 12 }}>
          {row.reference}
        </span>
      ),
    },
    {
      header: "Payer",
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600 }}>{payerName(row)}</span>
          <span
            style={{
              fontSize: 11.5,
              color: "var(--color-text-secondary)",
              fontFamily: "monospace",
            }}
          >
            {payerRegNumber(row)}
          </span>
        </div>
      ),
    },
    {
      header: "Amount",
      render: (row) => (
        <span style={{ fontWeight: 600 }}>
          {formatAmount(row.amount, row.currency)}
        </span>
      ),
    },
    {
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    { header: "Channel", render: (row) => row.channel ?? "—" },
    {
      header: "Paid At",
      render: (row) => (row.paidAt ? formatDateTime(row.paidAt) : "—"),
    },
    {
      header: "Actions",
      render: (row) => (
        <ActionDropDown
          actions={[
            {
              label: "View Details",
              icon: <Eye size={13} />,
              onClick: () => onView(row),
            },
            {
              label: "Re-verify",
              icon: <RefreshCw size={13} />,
              onClick: () => reverify(row._id),
              disabled: reverifying || !canReverify(row),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <GeneralTable<Payment>
      columns={columns}
      data={payments}
      loading={isLoading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}
