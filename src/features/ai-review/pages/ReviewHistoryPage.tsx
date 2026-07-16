import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import { ErrorState, PageLoading } from "../../../components/feedback/States";
import { useAuditLog, useRevisions } from "../hooks/useReviews";

export function ReviewHistoryPage() {
  const { reviewId = "" } = useParams();
  const revisions = useRevisions(reviewId);
  const audit = useAuditLog(reviewId);
  if (revisions.isLoading || audit.isLoading)
    return <PageLoading label="Loading review history" />;
  if (revisions.isError || audit.isError)
    return <ErrorState message="Unable to load review history." />;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Revision history</h1>
          <p className="mt-1 text-sm text-gray-600">
            Generated output and coach actions are immutable.
          </p>
        </div>
        <Link to={`/reviews/${reviewId}`}>
          <Button variant="secondary" icon={ArrowLeft}>
            Back to review
          </Button>
        </Link>
      </div>
      <Card>
        <h2 className="font-bold text-ink">Coach revisions</h2>
        <ol className="mt-4 space-y-4">
          {revisions.data?.items.length ? (
            revisions.data.items.map((revision) => (
              <li
                key={revision.id}
                className="border-l-2 border-brand-300 pl-4"
              >
                <p className="font-semibold">
                  Revision {revision.revision_number}
                </p>
                <p className="text-sm text-gray-600">
                  {revision.change_summary || "No change summary"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {new Date(revision.created_at).toLocaleString()}
                </p>
              </li>
            ))
          ) : (
            <li className="text-sm text-gray-600">
              No coach revisions. The generated result is active.
            </li>
          )}
        </ol>
      </Card>
      <Card>
        <h2 className="font-bold text-ink">Audit history</h2>
        <ol className="mt-4 space-y-3">
          {audit.data?.items.map((event) => (
            <li key={event.id}>
              <p className="font-semibold text-sm">
                {event.action_type.replace(/_/g, " ")}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(event.occurred_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
