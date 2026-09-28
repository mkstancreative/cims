import { useState } from "react";
import {
  Receipt,
  CircleCheck,
  Clock,
  XCircle,
  AlertTriangle,
  CreditCard,
  DollarSign,
  Activity,
  ChevronDown,
} from "lucide-react";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import StatCard from "../../components/ui/StatCard/StatCard";
import {
  ActiveFilterChips,
  FilterPopover,
  type FilterSection,
} from "../../components/ui/FilterPopover/FilterPopover";
import PaymentsTable from "../../components/admin/tables/PaymentsTable";
import PaymentViewModal from "../../components/admin/view/PaymentViewModal";
import { useModal } from "../../context/ModalContext";
import { usePaymentSummary } from "../../hooks/usePayments";
import { formatAmount, normalizeSummary } from "../../helpers/payment";
import type {
  Payment,
  PaymentParams,
  PaymentDateField,
} from "../../api/types/payment";
import "./Payments.css";

const STATUS_OPTIONS = [
  "pending",
  "success",
  "failed",
  "abandoned",
  "reversed",
  "refunded",
  "cancelled",
];

// Remembers whether the admin collapsed "Transaction Statuses".
const STATUSES_OPEN_KEY = "payments.statusesOpen";

const readStatusesOpen = () => {
  try {
    return localStorage.getItem(STATUSES_OPEN_KEY) !== "false";
  } catch {
    return true;
  }
};

const DATE_FIELD_OPTIONS = [
  { value: "createdAt", label: "Date Created" },
  { value: "paidAt", label: "Date Paid" },
  { value: "verifiedAt", label: "Date Verified" },
  { value: "updatedAt", label: "Date Updated" },
];

interface FilterState {
  search: string;
  /** Held as a list, sent to the API as a comma-separated string. */
  statuses: string[];
  channel: string;
  dateField: PaymentDateField;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  page: number;
  limit: number;
}

const INITIAL_FILTERS: FilterState = {
  search: "",
  statuses: [],
  channel: "",
  dateField: "createdAt",
  startDate: "",
  endDate: "",
  minAmount: "",
  maxAmount: "",
  page: 1,
  limit: 10,
};

export default function Payments() {
  const { openModal, closeModal } = useModal();
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [statusesOpen, setStatusesOpen] = useState(readStatusesOpen);

  const setField = <K extends keyof FilterState>(
    field: K,
    value: FilterState[K],
  ) => setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));

  const handleReset = () => setFilters(INITIAL_FILTERS);

  // Clears the filters but keeps whatever is typed in the search box.
  const clearFilters = () =>
    setFilters((prev) => ({ ...INITIAL_FILTERS, search: prev.search }));

  const naira = (v: string) => `₦${Number(v).toLocaleString()}`;

  const filterSections: FilterSection[] = [
    {
      key: "status",
      label: "Status",
      multiple: true,
      options: STATUS_OPTIONS.map((st) => ({
        value: st,
        label: st.charAt(0).toUpperCase() + st.slice(1),
      })),
      // Several at once — sent to the API comma-separated.
      value: filters.statuses.join(","),
      onChange: (v) => setField("statuses", v.split(",").filter(Boolean)),
    },
    {
      key: "channel",
      label: "Channel",
      options: [
        { value: "", label: "All Channels" },
        { value: "card", label: "Card" },
        { value: "bank", label: "Bank" },
        { value: "transfer", label: "Transfer" },
        { value: "ussd", label: "USSD" },
      ],
      value: filters.channel,
      onChange: (v) => setField("channel", v),
    },
    {
      key: "dateField",
      label: "Date field",
      options: DATE_FIELD_OPTIONS,
      value: filters.dateField,
      defaultValue: INITIAL_FILTERS.dateField,
      hint: "Which date the From / To range applies to.",
      onChange: (v) => setField("dateField", v as PaymentDateField),
    },
    {
      key: "startDate",
      label: "From",
      input: { type: "date" },
      value: filters.startDate,
      onChange: (v) => setField("startDate", v),
    },
    {
      key: "endDate",
      label: "To",
      input: { type: "date" },
      value: filters.endDate,
      onChange: (v) => setField("endDate", v),
    },
    {
      key: "minAmount",
      label: "Min amount (₦)",
      input: { type: "number", min: 0, placeholder: "e.g. 5000" },
      value: filters.minAmount,
      formatValue: naira,
      onChange: (v) => setField("minAmount", v),
    },
    {
      key: "maxAmount",
      label: "Max amount (₦)",
      input: { type: "number", min: 0, placeholder: "e.g. 50000" },
      value: filters.maxAmount,
      formatValue: naira,
      onChange: (v) => setField("maxAmount", v),
    },
  ];

  // Only send a date range once a bound is set — `dateField` alone filters nothing.
  const hasDateRange = Boolean(filters.startDate || filters.endDate);

  const params: PaymentParams = {
    page: filters.page,
    limit: filters.limit,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.statuses.length
      ? { status: filters.statuses.join(",") }
      : {}),
    ...(filters.channel ? { channel: filters.channel } : {}),
    ...(hasDateRange ? { dateField: filters.dateField } : {}),
    ...(filters.startDate ? { startDate: filters.startDate } : {}),
    ...(filters.endDate ? { endDate: filters.endDate } : {}),
    ...(filters.minAmount ? { minAmount: Number(filters.minAmount) } : {}),
    ...(filters.maxAmount ? { maxAmount: Number(filters.maxAmount) } : {}),
  };

  // The summary reflects the same filters, minus pagination.
  const summaryParams: PaymentParams = { ...params };
  delete summaryParams.page;
  delete summaryParams.limit;

  const { data: summaryResponse } = usePaymentSummary(summaryParams);
  const summary = normalizeSummary(summaryResponse);

  const toggleStatuses = () =>
    setStatusesOpen((open) => {
      try {
        localStorage.setItem(STATUSES_OPEN_KEY, String(!open));
      } catch {
        // Storage blocked — the toggle still works for this visit.
      }
      return !open;
    });

  const openView = (payment: Payment) =>
    openModal(
      <PaymentViewModal
        key={payment._id}
        isOpen
        onClose={closeModal}
        id={payment._id}
      />,
    );

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <Receipt size={20} />
          </div>
          <div>
            <h2 className="page-title">Payments</h2>
            <p className="page-sub">
              Track registration payments and re-verify stuck transactions
            </p>
          </div>
        </div>
      </div>

      {/* ── Summary ── */}
      <div className="section-title-divider" style={{ marginTop: 0, marginBottom: 12 }}>Financial Reconciliation</div>
      <div className="payments-summary-grid">
        <StatCard
          label="Total Collected"
          value={formatAmount(summary.paidAmount)}
          icon={<DollarSign size={20} />}
          color="var(--color-primary-hover)"
        />
        <StatCard
          label="Total Settled"
          value={formatAmount(summary.settledAmount)}
          icon={<CircleCheck size={20} />}
          color="var(--color-slate)"
        />
        <StatCard
          label="Gateway Fees"
          value={formatAmount(summary.gatewayFees)}
          icon={<CreditCard size={20} />}
          color="#f59e0b"
        />
        <StatCard
          label="Settlement Gap"
          value={formatAmount(summary.settlementGap)}
          icon={<AlertTriangle size={20} />}
          color={summary.settlementGap > 0 ? "#ef4444" : "#6b7280"}
        />
      </div>

      <button
        type="button"
        className="section-title-divider payments-section-toggle"
        onClick={toggleStatuses}
        aria-expanded={statusesOpen}
        aria-controls="payments-statuses"
      >
        Transaction Statuses
        <ChevronDown size={16} className="payments-section-toggle__icon" />
      </button>
      <div
        id="payments-statuses"
        className={`payments-collapse${statusesOpen ? " is-open" : ""}`}
        inert={!statusesOpen}
      >
        <div className="payments-collapse__inner">
          <div className="payments-summary-grid">
            <StatCard
              label="Total Attempts"
              value={summary.totalCount}
              icon={<Activity size={20} />}
              color="var(--color-secondary)"
            />
            <StatCard
              label="Successful"
              value={summary.paidCount}
              icon={<CircleCheck size={20} />}
              color="var(--color-primary-hover)"
            />
            <StatCard
              label="Pending"
              value={summary.pendingCount}
              icon={<Clock size={20} />}
              color="#f9a825"
            />
            <StatCard
              label="Failed / Abandoned"
              value={`${summary.failedCount} / ${summary.abandonedCount}`}
              icon={<XCircle size={20} />}
              color="#c62828"
            />
          </div>
        </div>
      </div>

      {/* ── Filters + search ── */}
      <div className="filter-wrapper fp-toolbar">
        <div className="fp-toolbar__row">
          <div className="fp-toolbar__search">
            <SearchInput
              value={filters.search}
              onChange={(val) => setField("search", val)}
              placeholder="Search by payer name or email…"
              onClear={() => setField("search", "")}
            />
          </div>
          <FilterPopover sections={filterSections} onClearAll={clearFilters} />
          <ResetButton onClick={handleReset} />
        </div>
        <ActiveFilterChips sections={filterSections} onClearAll={clearFilters} />
      </div>

      <div className="table-wrapper">
        <PaymentsTable
          params={params}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          onLimitChange={(l) => setField("limit", l)}
          onView={openView}
        />
      </div>
    </div>
  );
}
