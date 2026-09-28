import { useState } from "react";
import { ClipboardCheck, CheckCircle2, X } from "lucide-react";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import {
  ActiveFilterChips,
  FilterPopover,
  type FilterSection,
} from "../../components/ui/FilterPopover/FilterPopover";
import RegistrationsTable from "../../components/admin/tables/RegistrationsTable";
import EnrollRegistrationForm from "../../components/admin/forms/EnrollRegistrationForm";
import RejectRegistrationForm from "../../components/admin/forms/RejectRegistrationForm";
import { useModal } from "../../context/ModalContext";
import { toast } from "react-toastify";
import { useDurations } from "../../hooks/useDurations";
import { useInstitutions } from "../../hooks/useInstitutions";
import { useDepartments } from "../../hooks/useBatches";
import {
  PROGRAM_TYPES,
  PROGRAM_LEVELS_BY_TYPE,
} from "../../helpers/programConstants";
import { durationKey } from "../../helpers/registration";
import { durationLabel } from "../../helpers/duration";
import {
  ENROLL_MAX_IDS,
  type Registration,
} from "../../api/types/registration";
import "./Registrations.css";

interface FilterState {
  status: string;
  type: string;
  /** Institution `_id`. */
  institution: string;
  programType: string;
  programLevel: string;
  /** Department name. */
  department: string;
  /** Duration `_id`; filter by the target batch's tier before selecting. */
  duration: string;
  search: string;
  page: number;
  limit: number;
}

const INITIAL_FILTERS: FilterState = {
  status: "new",
  type: "",
  institution: "",
  programType: "",
  programLevel: "",
  department: "",
  duration: "",
  search: "",
  page: 1,
  limit: 10,
};

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "new", label: "New registration" },
  { value: "re-enroll", label: "Re-enrolment" },
];

const PROGRAM_TYPE_OPTIONS = [
  { value: "", label: "All Programs" },
  ...PROGRAM_TYPES.map((p) => ({ value: p, label: p })),
];

// Every level across programmes, for when no programme type is chosen.
const ALL_LEVELS = [...new Set(Object.values(PROGRAM_LEVELS_BY_TYPE).flat())];

export default function Registrations() {
  const { openModal, closeModal } = useModal();

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  // Kept across pages and filters so a selection can be built up; keyed by id
  // so the enrol dialog has names and paid durations to work with.
  const [selected, setSelected] = useState<Map<string, Registration>>(
    () => new Map(),
  );

  const { data: durationsResp } = useDurations({ limit: 100 });
  const { data: institutionsResp } = useInstitutions({ limit: 100 });
  const { data: departmentsResp } = useDepartments();

  const durationOptions = [
    { value: "", label: "All Durations" },
    ...(durationsResp?.data ?? []).map((d) => ({ value: d._id, label: d.label })),
  ];
  const institutionOptions = [
    { value: "", label: "All Institutions" },
    ...(institutionsResp?.data ?? []).map((i) => ({
      value: i._id,
      label: i.name,
    })),
  ];
  const departmentOptions = [
    { value: "", label: "All Departments" },
    ...(departmentsResp?.data ?? []).map((d) => ({ value: d, label: d })),
  ];
  const levelOptions = [
    { value: "", label: "All Levels" },
    ...(filters.programType
      ? (PROGRAM_LEVELS_BY_TYPE[filters.programType] ?? [])
      : ALL_LEVELS
    ).map((l) => ({ value: l, label: l })),
  ];

  const setField = <K extends keyof FilterState>(
    field: K,
    value: FilterState[K],
  ) =>
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      // Levels belong to a programme type, so a type change clears the level.
      ...(field === "programType" ? { programLevel: "" } : {}),
      page: 1,
    }));

  // Clears the filters but keeps whatever is typed in the search box.
  const clearFilters = () =>
    setFilters((prev) => ({ ...INITIAL_FILTERS, search: prev.search }));

  const filterSections: FilterSection[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "new", label: "New" },
        { value: "enrolled", label: "Enrolled" },
        { value: "rejected", label: "Rejected" },
      ],
      value: filters.status,
      defaultValue: INITIAL_FILTERS.status,
      onChange: (v) => setField("status", v),
    },
    {
      key: "duration",
      label: "Duration",
      options: durationOptions,
      value: filters.duration,
      onChange: (v) => setField("duration", v),
    },
    {
      key: "type",
      label: "Type",
      options: TYPE_OPTIONS,
      value: filters.type,
      onChange: (v) => setField("type", v),
    },
    {
      key: "institution",
      label: "Institution",
      options: institutionOptions,
      value: filters.institution,
      onChange: (v) => setField("institution", v),
    },
    {
      key: "department",
      label: "Department",
      options: departmentOptions,
      value: filters.department,
      onChange: (v) => setField("department", v),
    },
    {
      key: "programType",
      label: "Program type",
      options: PROGRAM_TYPE_OPTIONS,
      value: filters.programType,
      onChange: (v) => setField("programType", v),
    },
    {
      key: "programLevel",
      label: "Program level",
      options: levelOptions,
      value: filters.programLevel,
      onChange: (v) => setField("programLevel", v),
    },
  ];

  // ── Selection ──────────────────────────────────────────────────────────────
  // A bulk enrolment never mixes durations: the first pick locks the group,
  // and only registrations that paid for the same tier can join it.
  const firstSelected: Registration | undefined = selected.values().next().value;
  const lockedDuration = firstSelected ? durationKey(firstSelected) : null;
  const lockedLabel = firstSelected
    ? firstSelected.duration
      ? durationLabel(firstSelected.duration)
      : "No duration (older registrations)"
    : null;

  const toggleRow = (registration: Registration) =>
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(registration._id)) {
        next.delete(registration._id);
        return next;
      }
      const lock = prev.size
        ? durationKey(prev.values().next().value as Registration)
        : null;
      if (lock !== null && durationKey(registration) !== lock) return prev;
      next.set(registration._id, registration);
      return next;
    });

  const togglePage = (registrations: Registration[], select: boolean) =>
    setSelected((prev) => {
      const next = new Map(prev);
      if (!select) {
        registrations.forEach((r) => next.delete(r._id));
        return next;
      }
      const lock = prev.size
        ? durationKey(prev.values().next().value as Registration)
        : registrations[0]
          ? durationKey(registrations[0])
          : null;
      registrations
        .filter((r) => durationKey(r) === lock)
        .forEach((r) => next.set(r._id, r));
      return next;
    });

  const dropFromSelection = (ids: string[]) =>
    setSelected((prev) => {
      if (!ids.some((id) => prev.has(id))) return prev;
      const next = new Map(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });

  const selectedCount = selected.size;
  const overCap = selectedCount > ENROLL_MAX_IDS;

  // ── Modals ─────────────────────────────────────────────────────────────────
  const openEnroll = (registrations: Registration[]) => {
    // Belt and braces: the selection can't be mixed, but never send one that is.
    if (new Set(registrations.map(durationKey)).size > 1) {
      toast.error(
        "Selected applicants paid for different durations. Enroll one duration at a time.",
      );
      return;
    }
    openModal(
      <EnrollRegistrationForm
        key={registrations.map((r) => r._id).join(",")}
        isOpen
        onClose={closeModal}
        registrations={registrations}
        onEnrolled={dropFromSelection}
        onShowDuration={(durationId) =>
          setFilters((prev) => ({
            ...prev,
            status: "new",
            duration: durationId,
            page: 1,
          }))
        }
      />,
    );
  };

  const openReject = (registration: Registration) =>
    openModal(
      <RejectRegistrationForm
        key={registration._id}
        isOpen
        onClose={closeModal}
        registration={registration}
      />,
    );

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <ClipboardCheck size={20} />
          </div>
          <div>
            <h2 className="page-title">Registrations</h2>
            <p className="page-sub">Review and process applicant registrations</p>
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
              placeholder="Search by name, reg. number…"
              onClear={() => setField("search", "")}
            />
          </div>
          <FilterPopover sections={filterSections} onClearAll={clearFilters} />

          <ResetButton onClick={() => setFilters(INITIAL_FILTERS)} />
        </div>
        <ActiveFilterChips sections={filterSections} onClearAll={clearFilters} />
      </div>

      {/* ── Bulk enrol bar ── */}
      {selectedCount > 0 && (
        <div className="reg-bulk-bar" role="region" aria-label="Bulk enrolment">
          <div className="reg-bulk-bar__info">
            <strong>
              {selectedCount} selected
            </strong>
            <span className={overCap ? "reg-bulk-bar__warn" : undefined}>
              {overCap
                ? `Up to ${ENROLL_MAX_IDS} can be enrolled at once — deselect ${
                    selectedCount - ENROLL_MAX_IDS
                  }.`
                : `Duration: ${lockedLabel} — only applicants who paid for this can be added.`}
            </span>
          </div>
          <div className="reg-bulk-bar__actions">
            <button
              type="button"
              className="reg-bulk-bar__clear"
              onClick={() => setSelected(new Map())}
            >
              <X size={14} /> Clear
            </button>
            <button
              type="button"
              className="reg-bulk-bar__enroll"
              onClick={() => openEnroll([...selected.values()])}
              disabled={overCap}
            >
              <CheckCircle2 size={15} /> Enroll into batch…
            </button>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <RegistrationsTable
          params={filters}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          onLimitChange={(l) => setField("limit", l)}
          onEnroll={(registration) => openEnroll([registration])}
          onReject={openReject}
          selectedIds={new Set(selected.keys())}
          onToggleRow={toggleRow}
          onTogglePage={togglePage}
          lockedDuration={lockedDuration}
        />
      </div>
    </div>
  );
}
