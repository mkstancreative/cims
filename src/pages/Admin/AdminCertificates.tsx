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

import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import CertificateView from "../../components/admin/view/CertificateView/CertificateView";
import StatCard from "../../components/ui/StatCard/StatCard";
import DateFilter from "../../components/ui/DateFilter/DateFilter";
import Button from "../../components/ui/Button/Button";
import CustomConfirm from "../../components/ui/CustomConfirm";

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
    startDate: "2025-01-01",
    endDate: "2026-12-31",
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
      startDate: "2025-01-01",
      endDate: "2026-12-31",
      search: "",
      status: "",
      page: 1,
      limit: 10,
    });
    setSelectedIds(new Set());
  };

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

      <div className="filter-wrapper">
        <SearchInput
          value={filters.search}
          onChange={(val) => setField("search", val)}
          placeholder="Search requests..."
          onClear={handleReset}
        />
      </div>

      <div
        className="filter-selects-block"
        style={{
          marginTop: "15px",
          display: "flex",
          gap: "10px",
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <SelectFilter
          label="Approval Status"
          options={[
            { value: "", label: "All Status" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
          ]}
          value={filters.status}
          onChange={(v) => setField("status", v)}
          name="status"
        />
        <DateFilter
          label="Start Date"
          value={filters.startDate}
          onChange={(v) => setField("startDate", v)}
        />

        <DateFilter
          label="End Date"
          value={filters.endDate}
          onChange={(v) => setField("endDate", v)}
        />

        <ResetButton onClick={handleReset} />
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
