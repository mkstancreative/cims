import { useState } from "react";
import { Briefcase } from "lucide-react";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import InternshipsTable from "../../components/admin/tables/InternshipsTable";
import InternshipStatusForm from "../../components/admin/forms/InternshipStatusForm";
import { useModal } from "../../context/ModalContext";
import { useBatches } from "../../hooks/useBatches";
import {
  PROGRAM_TYPES,
  PROGRAM_LEVELS_BY_TYPE,
} from "../../helpers/programConstants";
import type {
  Internship,
  InternshipStatus,
} from "../../api/types/internship";

interface FilterState {
  search: string;
  studentId: string;
  batchId: string;
  itStatus: InternshipStatus | "";
  session: string;
  program: string;
  level: string;
  page: number;
  limit: number;
}

const INITIAL_FILTERS: FilterState = {
  search: "",
  studentId: "",
  batchId: "",
  itStatus: "",
  session: "",
  program: "",
  level: "",
  page: 1,
  limit: 20,
};

export default function Internships() {
  const { openModal, closeModal } = useModal();
  const { data: batches } = useBatches();

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const setField = <K extends keyof FilterState>(
    field: K,
    value: FilterState[K],
  ) => setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));

  const handleReset = () => setFilters(INITIAL_FILTERS);

  const handleProgramChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      program: value,
      level: "",
      page: 1,
    }));
  };

  const openChangeStatus = (internship: Internship) =>
    openModal(
      <InternshipStatusForm
        key={internship._id}
        isOpen
        onClose={closeModal}
        internship={internship}
      />,
    );

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <Briefcase size={20} />
          </div>
          <div>
            <h2 className="page-title">Internships</h2>
            <p className="page-sub">Track and manage student internships</p>
          </div>
        </div>
      </div>

      <div className="filter-wrapper">
        <SearchInput
          value={filters.search}
          onChange={(val) => setField("search", val)}
          placeholder="Search by student name…"
          onClear={handleReset}
        />
      </div>

      <div
        className="filter-selects-block"
        style={{ flexWrap: "wrap", gap: "12px 14px" }}
      >
        <SelectFilter
          label="Status"
          options={[
            { value: "", label: "All Status" },
            { value: "placed", label: "Placed" },
            { value: "active", label: "Active" },
            { value: "completed", label: "Completed" },
          ]}
          value={filters.itStatus}
          onChange={(value) =>
            setField("itStatus", value as InternshipStatus | "")
          }
          name="itStatus"
        />

        <SelectFilter
          label="Batch"
          options={[
            { value: "", label: "All Batches" },
            ...(batches?.data.map((b) => ({
              value: b._id,
              label: b.name,
            })) || []),
          ]}
          value={filters.batchId}
          onChange={(value) => setField("batchId", value)}
          name="batchId"
        />

        <SelectFilter
          label="Program"
          options={[
            { value: "", label: "All Programs" },
            ...PROGRAM_TYPES.map((pt) => ({ value: pt, label: pt })),
          ]}
          value={filters.program}
          onChange={handleProgramChange}
          name="program"
        />

        <SelectFilter
          label="Level"
          options={[
            { value: "", label: "All Levels" },
            ...(filters.program
              ? (PROGRAM_LEVELS_BY_TYPE[filters.program] || []).map((pl) => ({
                  value: pl,
                  label: pl,
                }))
              : []),
          ]}
          value={filters.level}
          onChange={(value) => setField("level", value)}
          name="level"
          key={filters.program}
        />

        <div className="filter-container">
          <label className="filter-label">Session</label>
          <input
            className="modal-input"
            placeholder="e.g. 2023/2024"
            value={filters.session}
            onChange={(e) => setField("session", e.target.value)}
            style={{
              height: 38,
              padding: "0 12px",
              borderRadius: 8,
              border: "1px solid var(--color-accent-border)",
              background: "var(--color-bg-primary)",
              color: "var(--color-text-primary)",
              fontSize: 13,
              outline: "none",
              width: 140,
            }}
          />
        </div>

        <div className="filter-container">
          <label className="filter-label">Student ID</label>
          <input
            className="modal-input"
            placeholder="e.g. 6088e…"
            value={filters.studentId}
            onChange={(e) => setField("studentId", e.target.value)}
            style={{
              height: 38,
              padding: "0 12px",
              borderRadius: 8,
              border: "1px solid var(--color-accent-border)",
              background: "var(--color-bg-primary)",
              color: "var(--color-text-primary)",
              fontSize: 13,
              outline: "none",
              width: 150,
            }}
          />
        </div>

        <ResetButton onClick={handleReset} />
      </div>

      <div className="table-wrapper">
        <InternshipsTable
          search={filters.search}
          status={filters.itStatus}
          studentId={filters.studentId}
          batchId={filters.batchId}
          itStatus={filters.itStatus}
          session={filters.session}
          program={filters.program}
          level={filters.level}
          page={filters.page}
          limit={filters.limit}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          onLimitChange={(l) => setField("limit", l)}
          onChangeStatus={openChangeStatus}
        />
      </div>
    </div>
  );
}
