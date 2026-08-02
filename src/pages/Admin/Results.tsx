import { useState } from "react";
import { Trophy } from "lucide-react";
import ResultsTable from "../../components/admin/tables/ResultsTable";

interface FilterState {
  page: number;
  limit: number;
}

export default function Results() {
  const [filters, setFilters] = useState<FilterState>({ page: 1, limit: 10 });

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <Trophy size={20} />
          </div>
          <div>
            <h2 className="page-title">Results</h2>
            <p className="page-sub">Ranked composite evaluation results</p>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <ResultsTable
          page={filters.page}
          limit={filters.limit}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          onLimitChange={(l) => setFilters({ page: 1, limit: l })}
        />
      </div>
    </div>
  );
}
