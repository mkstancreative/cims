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
} from "lucide-react";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import DateFilter from "../../components/ui/DateFilter/DateFilter";
import StatCard from "../../components/ui/StatCard/StatCard";
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

const DATE_FIELD_OPTIONS = [
  { value: "createdAt", label: "Date Created" },
  { value: "paidAt", label: "Date Paid" },
  { value: "verifiedAt", label: "Date Verified" },
  { value: "updatedAt", label: "Date Updated" },
];

interface FilterState {
  search: string;
  reference: string;
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
  reference: "",
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

  const setField = <K extends keyof FilterState>(
    field: K,
    value: FilterState[K],
  ) => setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));

  const toggleStatus = (status: string) =>
    setFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
      page: 1,
    }));

  const handleReset = () => setFilters(INITIAL_FILTERS);

  // Only send a date range once a bound is set — `dateField` alone filters nothing.
  const hasDateRange = Boolean(filters.startDate || filters.endDate);

  const params: PaymentParams = {
    page: filters.page,
    limit: filters.limit,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.reference ? { reference: filters.reference } : {}),
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
          color="#0f9d58"
        />
        <StatCard
          label="Total Settled"
          value={formatAmount(summary.settledAmount)}
          icon={<CircleCheck size={20} />}
          color="#1976d2"
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

      <div className="section-title-divider" style={{ marginTop: 18, marginBottom: 12 }}>Transaction Statuses</div>
      <div className="payments-summary-grid">
        <StatCard
          label="Total Attempts"
          value={summary.totalCount}
          icon={<Activity size={20} />}
          color="#7b1fa2"
        />
        <StatCard
          label="Successful"
          value={summary.paidCount}
          icon={<CircleCheck size={20} />}
          color="#2e7d32"
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

      {/* ── Search ── */}
      <div className="filter-wrapper">
        <SearchInput
          value={filters.search}
          onChange={(val) => setField("search", val)}
          placeholder="Search by payer name or email…"
          onClear={handleReset}
        />
      </div>

      {/* ── Status chips → comma-separated `status` ── */}
      <div className="payments-chip-row">
        <span className="payments-chip-label">Status</span>
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            type="button"
            className={`payments-chip payments-chip--${status}${
              filters.statuses.includes(status) ? " is-active" : ""
            }`}
            onClick={() => toggleStatus(status)}
            aria-pressed={filters.statuses.includes(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="filter-selects-block">
        <SelectFilter
          label="Channel"
          options={[
            { value: "", label: "All Channels" },
            { value: "card", label: "Card" },
            { value: "bank", label: "Bank" },
            { value: "transfer", label: "Transfer" },
            { value: "ussd", label: "USSD" },
          ]}
          value={filters.channel}
          onChange={(value) => setField("channel", value)}
          name="channel"
        />
        <SelectFilter
          label="Date Field"
          options={DATE_FIELD_OPTIONS}
          value={filters.dateField}
          onChange={(value) =>
            setField("dateField", value as PaymentDateField)
          }
          name="dateField"
        />
        <DateFilter
          label="From"
          value={filters.startDate}
          onChange={(value) => setField("startDate", value)}
          name="startDate"
        />
        <DateFilter
          label="To"
          value={filters.endDate}
          onChange={(value) => setField("endDate", value)}
          name="endDate"
        />
        <div className="payments-amount-range">
          <span className="payments-amount-range-label">Amount (₦)</span>
          <div className="payments-amount-inputs">
            <input
              type="number"
              min={0}
              className="payments-amount-input"
              placeholder="Min"
              value={filters.minAmount}
              onChange={(e) => setField("minAmount", e.target.value)}
            />
            <span className="payments-amount-sep">–</span>
            <input
              type="number"
              min={0}
              className="payments-amount-input"
              placeholder="Max"
              value={filters.maxAmount}
              onChange={(e) => setField("maxAmount", e.target.value)}
            />
          </div>
        </div>
        <ResetButton onClick={handleReset} />
      </div>

      {/* ── Reference (partial match) ── */}
      <div className="filter-wrapper">
        <SearchInput
          value={filters.reference}
          onChange={(val) => setField("reference", val)}
          placeholder="Filter by reference (partial match)…"
          onClear={() => setField("reference", "")}
        />
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
