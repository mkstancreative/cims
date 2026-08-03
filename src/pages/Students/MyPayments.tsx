import { useState } from "react";
import { Receipt } from "lucide-react";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import DateFilter from "../../components/ui/DateFilter/DateFilter";
import MyPaymentsTable from "../../components/student/tables/MyPaymentsTable";
import type { PaymentParams } from "../../api/types/payment";
import "./MyPayments.css";

interface FilterState {
  status: string;
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
}

const INITIAL_FILTERS: FilterState = {
  status: "",
  startDate: "",
  endDate: "",
  page: 1,
  limit: 10,
};

export default function MyPayments() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const setField = <K extends keyof FilterState>(
    field: K,
    value: FilterState[K],
  ) => setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));

  const handleReset = () => setFilters(INITIAL_FILTERS);

  const params: PaymentParams = {
    page: filters.page,
    limit: filters.limit,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.startDate || filters.endDate
      ? { dateField: "createdAt" as const }
      : {}),
    ...(filters.startDate ? { startDate: filters.startDate } : {}),
    ...(filters.endDate ? { endDate: filters.endDate } : {}),
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <Receipt size={20} />
          </div>
          <div>
            <h2 className="page-title">My Payments</h2>
            <p className="page-sub">
              Your registration payment history and receipts
            </p>
          </div>
        </div>
      </div>

      <div className="filter-selects-block">
        <SelectFilter
          label="Status"
          options={[
            { value: "", label: "All Status" },
            { value: "success", label: "Successful" },
            { value: "pending", label: "Pending" },
            { value: "failed", label: "Failed" },
          ]}
          value={filters.status}
          onChange={(value) => setField("status", value)}
          name="status"
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
        <ResetButton onClick={handleReset} />
      </div>

      <div className="table-wrapper">
        <MyPaymentsTable
          params={params}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          onLimitChange={(l) => setField("limit", l)}
        />
      </div>
    </div>
  );
}
