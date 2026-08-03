import { ExternalLink } from "lucide-react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { useMyPayments } from "../../../hooks/usePayments";
import { formatDateTime } from "../../../helpers/utilities";
import { formatAmount } from "../../../helpers/payment";
import type { Payment, PaymentParams } from "../../../api/types/payment";

interface MyPaymentsTableProps {
  params: PaymentParams;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
}

/** An unpaid attempt can be resumed if the provider link is still live. */
function isResumable(payment: Payment): boolean {
  return (
    String(payment.status).toLowerCase() === "pending" &&
    Boolean(payment.authorizationUrl)
  );
}

export default function MyPaymentsTable({
  params,
  onPageChange,
  onLimitChange,
}: MyPaymentsTableProps) {
  const { data, isLoading } = useMyPayments(params);

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
      header: "Amount",
      render: (row) => (
        <span style={{ fontWeight: 600 }}>
          {formatAmount(row.amount, row.currency)}
        </span>
      ),
    },
    { header: "Purpose", render: (row) => row.purpose ?? "Registration" },
    {
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    { header: "Channel", render: (row) => row.channel ?? "—" },
    {
      header: "Date",
      render: (row) => formatDateTime(row.paidAt ?? row.createdAt),
    },
    {
      header: "",
      render: (row) =>
        isResumable(row) ? (
          <a
            href={row.authorizationUrl}
            className="my-payment-resume"
            rel="noopener noreferrer"
          >
            Complete payment <ExternalLink size={12} />
          </a>
        ) : (
          "—"
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
