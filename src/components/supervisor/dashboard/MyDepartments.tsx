import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import { SectionHead } from "../../shared/dashboard/DashboardKit";
import { useMyDepartments } from "../../../hooks/useSchoolSupervisor";
import { SkeletonRows } from "../../ui/Skeleton/Skeleton";
import "./MyDepartments.css";

const LIMIT = 20;

function errorStatus(err: unknown): number | undefined {
  return (err as { response?: { status?: number } })?.response?.status;
}

/**
 * The supervisor's departments with actively-training students. Each row
 * links through to the student list filtered by that department (by name —
 * there is no department id).
 */
export default function MyDepartments() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useMyDepartments({ page, limit: LIMIT });

  const departments = data?.data ?? [];
  // `pages` is 0 on an empty result — only page when there's more than one.
  const pages = data?.pages ?? 0;

  return (
    <div>
      <SectionHead
        title="My Departments"
        sub="Students actively training, by department"
        icon={<ClipboardList size={16} />}
        color="primary"
      />

      <div className="md-card">
        {isLoading ? (
          <SkeletonRows rows={3} label="Loading departments" />
        ) : errorStatus(error) === 404 ? (
          <p className="md-note">
            Your supervisor account isn't fully set up yet. Contact an
            administrator.
          </p>
        ) : error ? (
          <p className="md-note">Couldn't load your departments.</p>
        ) : departments.length === 0 ? (
          <p className="md-note">
            None of your students are actively training right now.
          </p>
        ) : (
          <ul className="md-list">
            {departments.map((d) => (
              <li key={d.id}>
                <Link
                  className="md-row"
                  to={`/supervisor/assigned-students?department=${encodeURIComponent(d.name)}`}
                >
                  <span className="md-row__main">
                    <span className="md-row__name">{d.name}</span>
                    <span className="md-row__meta">
                      {d.activeAndCurrent} on their current internship
                    </span>
                  </span>

                  {/* Working an earlier cycle while a newer one exists —
                      unscoped logbooks / progress / quiz land on the newer
                      one. Worth a look, not an error. */}
                  {d.activeAndNotCurrent > 0 && (
                    <span
                      className="md-warn"
                      title="Still training on an earlier internship while a newer placement exists. Their logbooks, progress and quiz default to the newer one."
                    >
                      <AlertTriangle size={12} />
                      {d.activeAndNotCurrent} on an earlier cycle
                    </span>
                  )}

                  <span className="md-row__count">
                    <strong>{d.totalActive}</strong>
                    <span>active</span>
                  </span>
                  <ChevronRight size={16} className="md-row__chev" />
                </Link>
              </li>
            ))}
          </ul>
        )}

        {pages > 1 && (
          <div className="md-pager">
            <button
              type="button"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={15} />
            </button>
            <span>
              Page {page} of {pages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= pages}
              aria-label="Next page"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
