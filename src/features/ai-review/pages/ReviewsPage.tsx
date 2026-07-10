import { BrainCircuit, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Badge } from "../../../components/common/Badge";
import { Card } from "../../../components/common/Card";
import { PageHeader } from "../../../components/common/PageHeader";
import { ErrorState, PageLoading } from "../../../components/feedback/States";
import { formatEnum } from "../../../lib/formatters";
import { useReviews } from "../hooks/useReviews";
import type { ReviewStatus } from "../types";

function tone(status: ReviewStatus): "green" | "amber" | "red" | "gray" {
  if (status === "approved") return "green";
  if (status === "failed" || status === "rejected") return "red";
  if (status === "generated") return "amber";
  return "gray";
}

export function ReviewsPage() {
  const { athleteId } = useParams();
  const reviews = useReviews(athleteId ? { athlete_id: athleteId } : undefined);
  if (reviews.isLoading) return <PageLoading label="Loading AI reviews" />;
  if (reviews.isError)
    return (
      <ErrorState
        message="Unable to load AI reviews."
        onRetry={() => reviews.refetch()}
      />
    );
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Reviews"
        description="Generated coaching drafts awaiting review or approval."
      />
      {!reviews.data?.length ? (
        <Card className="py-14 text-center">
          <BrainCircuit className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-3 font-semibold text-ink">No AI reviews yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Start one from an uploaded video.
          </p>
        </Card>
      ) : (
        <div className="divide-y divide-line rounded-md border border-line bg-white">
          {reviews.data.map((review) => (
            <Link
              key={review.id}
              to={`/reviews/${review.id}`}
              className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50"
            >
              <BrainCircuit className="h-5 w-5 text-brand-600" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">
                  {formatEnum(review.review_type)} review
                </p>
                <p className="truncate text-sm text-gray-500">
                  Video {review.video_id} ·{" "}
                  {new Date(review.created_at).toLocaleString()}
                </p>
              </div>
              <Badge tone={tone(review.status)}>
                {formatEnum(review.status)}
              </Badge>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
