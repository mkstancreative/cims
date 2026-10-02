import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelectedInternship } from "../context/useInternship";

/**
 * `/student/internships/:internshipId/…` links (bookmarks, older buttons):
 * select that internship in the switcher, then show the page for it.
 */
export default function SelectInternshipRedirect({ to }: { to: string }) {
  const { internshipId } = useParams<{ internshipId: string }>();
  const { select } = useSelectedInternship();
  const navigate = useNavigate();

  useEffect(() => {
    if (internshipId) select(internshipId);
    navigate(to, { replace: true });
  }, [internshipId, select, navigate, to]);

  return null;
}
