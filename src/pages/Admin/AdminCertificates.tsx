import { useState } from "react";
import type { AdminCertificateRequest } from "../../api/types/certificate";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import AdminCertTable from "../../components/admin/tables/AdminCertTable";
import { useModal } from "../../context/ModalContext";
import {
  useAllCertRequests,
  useBulkApproveCert,
  useBulkRejectCert,
  useCertFinancialStats,
} from "../../hooks/useCertificate";

import {
  ActiveFilterChips,
  FilterPopover,
  type FilterSection,
} from "../../components/ui/FilterPopover/FilterPopover";
import CertificateView from "../../components/admin/view/CertificateView/CertificateView";
import StatCard from "../../components/ui/StatCard/StatCard";
import Button from "../../components/ui/Button/Button";
import CustomConfirm from "../../components/ui/CustomConfirm";

// The page opens on this date window; it's the baseline, not an extra filter.
const DEFAULT_START = "2025-01-01";
const DEFAULT_END = "2026-12-31";

/** "2025-01-01" → "1 Jan 2025" (parsed as a local date, not UTC midnight). */
const formatDay = (value: string) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : value;

interface FilterStates {
  startDate: string;
  endDate: string;
  search: string;
  status: string | "";
  page: number;
  limit: number;
}

interface BulkResult {
  success: boolean;
  message: string;
  data: {
    successful: string[];
    failed: { id: string; reason: string }[];
  };
}

export default function AdminCertificates() {
  const { openModal, closeModal } = useModal();
  const [filters, setFilters] = useState<FilterStates>({
    startDate: DEFAULT_START,
    endDate: DEFAULT_END,
    search: "",
    status: "",
    page: 1,
    limit: 10,
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { data: requestsData, isLoading: loadingReqs } =
    useAllCertRequests(filters);
  const { data: stats } = useCertFinancialStats();

  const { mutate: approveBulk, isPending: approving } = useBulkApproveCert();
  const { mutate: rejectBulk, isPending: rejecting } = useBulkRejectCert();

  const handleReset = () => {
    setFilters({
      startDate: DEFAULT_START,
      endDate: DEFAULT_END,
      search: "",
      status: "",
      page: 1,
      limit: 10,
    });
    setSelectedIds(new Set());
  };

  // Clears the filters (dates back to the default window) but keeps whatever
  // is typed in the search box.
  const clearFilters = () => {
    setFilters((prev) => ({
      ...prev,
      status: "",
      startDate: DEFAULT_START,
      endDate: DEFAULT_END,
      page: 1,
    }));
    setSelectedIds(new Set());
  };

  const filterSections: FilterSection[] = [
    {
      key: "status",
      label: "Approval Status",
      options: [
        { value: "", label: "All Status" },
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
      ],
      value: filters.status,
      onChange: (v) => setField("status", v),
    },
    {
      key: "startDate",
      label: "Start date",
      input: { type: "date" },
      value: filters.startDate,
      defaultValue: DEFAULT_START,
      formatValue: formatDay,
      onChange: (v) => setField("startDate", v),
    },
    {
      key: "endDate",
      label: "End date",
      input: { type: "date" },
      value: filters.endDate,
      defaultValue: DEFAULT_END,
      formatValue: formatDay,
      onChange: (v) => setField("endDate", v),
    },
  ];

  const handleBulkApprove = () => {
    if (selectedIds.size === 0) return;

    openModal(
      <CustomConfirm
        isOpen={true}
        onClose={closeModal}
        title="Confirm Bulk Approval"
        message={`Are you sure you want to approve ${selectedIds.size} selected certificate requests? This action will notify the students.`}
        confirmText="Approve All"
        variant="success"
        isLoading={approving}
        onConfirm={() => {
          approveBulk(
            { certificateIds: Array.from(selectedIds) },
            {
              onSuccess: (res: BulkResult) => {
                if (res.data?.failed?.length > 0) {
                  // Show failure summary
                  openModal(
                    <CustomConfirm
                      isOpen={true}
                      onClose={() => {
                        closeModal();
                        setSelectedIds(new Set());
                      }}
                      onConfirm={() => closeModal()}
                      title="Bulk Approval Results"
                      message={
                        res.message ||
                        "Bulk operation completed with some errors."
                      }
                      confirmText="Done"
                      variant="primary"
                      cancelText=""
                      errors={res.data.failed.map((f) => ({
                        id: f.id,
                        reason: f.reason,
                      }))}
                    />,
                  );
                } else {
                  setSelectedIds(new Set());
                  closeModal();
                }
              },
            },
          );
        }}
      />,
    );
  };

  const handleBulkReject = () => {
    if (selectedIds.size === 0) return;

    openModal(
      <CustomConfirm
        isOpen={true}
        onClose={closeModal}
        title="Reject Certificate Requests"
        message={`You are about to reject ${selectedIds.size} requests. Please provide a reason for this rejection to inform the students.`}
        confirmText="Reject All"
        variant="danger"
        showInput={true}
        inputPlaceholder="e.g. Incomplete documentation, SIWES logbook not verified..."
        isLoading={rejecting}
        onConfirm={(reason) => {
          if (!reason?.trim()) {
            return;
          }
          rejectBulk(
            { certificateIds: Array.from(selectedIds), reason },
            {
              onSuccess: (res: BulkResult) => {
                if (res.data?.failed?.length > 0) {
                  openModal(
                    <CustomConfirm
                      isOpen={true}
                      onClose={() => {
                        closeModal();
                        setSelectedIds(new Set());
                      }}
                      onConfirm={() => closeModal()}
                      title="Bulk Rejection Results"
                      message={
                        res.message ||
                        "Bulk operation completed with some errors."
                      }
                      confirmText="Done"
                      variant="primary"
                      cancelText=""
                      errors={res.data.failed.map((f) => ({
                        id: f.id,
                        reason: f.reason,
                      }))}
                    />,
                  );
                } else {
                  setSelectedIds(new Set());
                  closeModal();
                }
              },
            },
          );
        }}
      />,
    );
  };

  const openDetails = (id: string) => {
    openModal(<CertificateView id={id} onClose={closeModal} />);
  };

  const meta = requestsData
    ? {
        page: requestsData.pagination.currentPage,
        pages: requestsData.pagination.totalPages,
        count: requestsData.pagination.totalItems,
        limit: filters.limit,
        hasPrev: requestsData.pagination.hasPrevPage,
        hasNext: requestsData.pagination.hasNextPage,
      }
    : null;

  const setField = <K extends keyof FilterStates>(
    field: K,
    value: FilterStates[K],
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const selectedItems =
    requestsData?.data?.filter((req: AdminCertificateRequest) =>
      selectedIds.has(req._id),
    ) || [];

  const showApprove =
    selectedIds.size > 0 &&
    filters.status !== "approved" &&
    (selectedItems.length === 0 ||
      selectedItems.some(
        (req: AdminCertificateRequest) => req.approvalStatus !== "approved",
      ));

  const showReject =
    selectedIds.size > 0 &&
    filters.status !== "rejected" &&
    (selectedItems.length === 0 ||
      selectedItems.some(
        (req: AdminCertificateRequest) => req.approvalStatus !== "rejected",
      ));

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="page-title">Certificate Requests</h2>
            <p className="page-sub">
              Manage and approve graduation certificates
            </p>
          </div>
        </div>
        <div className="page-header-right" style={{ gap: "10px" }}>
          {showReject && (
            <Button
              text={`Reject (${selectedIds.size})`}
              onClick={handleBulkReject}
              disabled={rejecting}
              variant="danger"
              size="medium"
              icon={<XCircle size={16} />}
            />
          )}

          {showApprove && (
            <Button
              text={`Approve (${selectedIds.size})`}
              onClick={handleBulkApprove}
              disabled={approving}
              variant="success"
              size="medium"
              icon={<CheckCircle size={16} />}
            />
          )}
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <StatCard
          label="Total Requests"
          value={stats?.data?.total || 0}
          icon={<FileText size={20} />}
          color="var(--color-slate)"
        />
        <StatCard
          label="Pending Approval"
          value={stats?.data?.byApprovalStatus?.pending || 0}
          icon={<Clock size={20} />}
          color="#d97706"
        />
        <StatCard
          label="Approved Requests"
          value={stats?.data?.byApprovalStatus?.approved || 0}
          icon={<CheckCircle size={20} />}
          color="var(--color-primary-hover)"
        />
        <StatCard
          label="Rejected Requests"
          value={stats?.data?.byApprovalStatus?.rejected || 0}
          icon={<XCircle size={20} />}
          color="#ef4444"
        />
      </div>

      <div className="filter-wrapper fp-toolbar">
        <div className="fp-toolbar__row">
          <FilterPopover sections={filterSections} onClearAll={clearFilters} />
          <div className="fp-toolbar__search">
            <SearchInput
              value={filters.search}
              onChange={(val) => setField("search", val)}
              placeholder="Search requests..."
              onClear={() => setField("search", "")}
            />
          </div>
          <ResetButton onClick={handleReset} />
        </div>
        <ActiveFilterChips sections={filterSections} onClearAll={clearFilters} />
      </div>

      <div className="table-wrapper" style={{ marginTop: "24px" }}>
        <AdminCertTable
          requests={requestsData?.data || []}
          meta={meta}
          loading={loadingReqs}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          onLimitChange={(l) => setField("limit", l)}
          onView={openDetails}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </div>
    </div>
  );
}
