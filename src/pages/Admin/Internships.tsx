import { useState } from "react";
import { Briefcase } from "lucide-react";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import {
  ActiveFilterChips,
  FilterPopover,
  type FilterSection,
} from "../../components/ui/FilterPopover/FilterPopover";
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

  // Clears the filters but keeps whatever is typed in the search box.
  const clearFilters = () =>
    setFilters((prev) => ({ ...INITIAL_FILTERS, search: prev.search }));

  const filterSections: FilterSection[] = [
    {
      key: "itStatus",
      label: "Status",
      options: [
        { value: "", label: "All Status" },
        { value: "placed", label: "Placed" },
        { value: "active", label: "Active" },
        { value: "completed", label: "Completed" },
      ],
      value: filters.itStatus,
      onChange: (v) => setField("itStatus", v as InternshipStatus | ""),
    },
    {
      key: "batchId",
      label: "Batch",
      options: [
        { value: "", label: "All Batches" },
        ...(batches?.data.map((b) => ({ value: b._id, label: b.name })) ?? []),
      ],
      value: filters.batchId,
      onChange: (v) => setField("batchId", v),
    },
    {
      key: "program",
      label: "Program",
      options: [
        { value: "", label: "All Programs" },
        ...PROGRAM_TYPES.map((pt) => ({ value: pt, label: pt })),
      ],
      value: filters.program,
      onChange: handleProgramChange,
    },
    {
      key: "level",
      label: "Level",
      options: [
        { value: "", label: "All Levels" },
        ...(PROGRAM_LEVELS_BY_TYPE[filters.program] ?? []).map((pl) => ({
          value: pl,
          label: pl,
        })),
      ],
      value: filters.level,
      onChange: (v) => setField("level", v),
      // Levels belong to a programme, so there's nothing to pick until one is.
      hint: filters.program ? undefined : "Choose a program first to filter by level.",
    },
    {
      key: "session",
      label: "Session",
      input: { placeholder: "e.g. 2023/2024" },
      value: filters.session,
      onChange: (v) => setField("session", v),
    },
    {
      key: "studentId",
      label: "Student ID",
      input: { placeholder: "e.g. 6088e…" },
      value: filters.studentId,
      onChange: (v) => setField("studentId", v),
    },
  ];

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

      <div className="filter-wrapper fp-toolbar">
        <div className="fp-toolbar__row">
          <div className="fp-toolbar__search">
            <SearchInput
              value={filters.search}
              onChange={(val) => setField("search", val)}
              placeholder="Search by student name…"
              onClear={() => setField("search", "")}
            />
          </div>
          <FilterPopover sections={filterSections} onClearAll={clearFilters} />
          <ResetButton onClick={handleReset} />
        </div>
        <ActiveFilterChips sections={filterSections} onClearAll={clearFilters} />
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
