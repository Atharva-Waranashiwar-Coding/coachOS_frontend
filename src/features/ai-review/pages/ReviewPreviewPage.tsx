import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import { ErrorState, PageLoading } from "../../../components/feedback/States";
import { ReviewSections } from "../components/ReviewSections";
import { usePreviewReview, useReview } from "../hooks/useReviews";
import type { ReviewVisibility } from "../types";

export function ReviewPreviewPage() {
  const { reviewId = "" } = useParams();
  const review = useReview(reviewId);
  const preview = usePreviewReview(reviewId);
  const [visibility, setVisibility] = useState<ReviewVisibility>("coach_only");
  const [message, setMessage] = useState("");
  if (review.isLoading) return <PageLoading label="Loading preview" />;
  if (review.isError || !review.data?.active_draft)
    return <ErrorState message="Preview is not available." />;
  const draft = review.data.active_draft;
  const result = preview.data ?? {
    ...draft,
    athlete_id: review.data.athlete_id,
    review_id: review.data.id,
    visibility,
    athlete_message: message || draft.athlete_message,
    is_preview: true,
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-brand-700">
            Athlete-facing preview
          </p>
          <h1 className="text-2xl font-bold text-ink">
            Exactly what the athlete can see
          </h1>
        </div>
        <Link to={`/reviews/${reviewId}/edit`}>
          <Button variant="secondary" icon={ArrowLeft}>
            Back to edit
          </Button>
        </Link>
      </div>
      <Card className="border-brand-200 bg-brand-50">
        <div className="flex flex-wrap items-end gap-4">
          <label className="text-sm font-semibold">
            Visibility
            <select
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value as ReviewVisibility)
              }
              className="mt-1 block rounded-md border border-line px-3 py-2 font-normal"
            >
              <option value="coach_only">Coach only</option>
              <option value="athlete_visible">Visible to athlete</option>
            </select>
          </label>
          <label className="min-w-64 flex-1 text-sm font-semibold">
            Athlete message
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 font-normal"
            />
          </label>
          <Button
            icon={Check}
            isLoading={preview.isPending}
            onClick={() =>
              preview.mutate({
                revision_id: draft.revision_id,
                visibility,
                athlete_message: message || null,
              })
            }
          >
            Refresh preview
          </Button>
        </div>
      </Card>
      <ReviewSections content={result} />
      {result.athlete_message && (
        <Card>
          <h2 className="font-bold text-ink">Message from your coach</h2>
          <p className="mt-2 text-sm text-gray-700">{result.athlete_message}</p>
        </Card>
      )}
    </div>
  );
}
