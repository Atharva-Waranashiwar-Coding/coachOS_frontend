import { Check, Edit3, RotateCcw, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { normalizeApiError } from "../../../api/api-client";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import { PageHeader } from "../../../components/common/PageHeader";
import { ErrorState, PageLoading } from "../../../components/feedback/States";
import { useToast } from "../../../components/feedback/Toast";
import { formatEnum } from "../../../lib/formatters";
import {
  useReview,
  useReviewTransition,
  useSaveReviewDraft,
} from "../hooks/useReviews";

export function ReviewDetailPage() {
  const { reviewId = "" } = useParams();
  const review = useReview(reviewId);
  const transition = useReviewTransition(reviewId);
  const saveDraft = useSaveReviewDraft(reviewId);
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState("");
  const effectiveResult = review.data?.latest_revision ?? review.data?.result;
  useEffect(
    () => setSummary(effectiveResult?.summary ?? ""),
    [effectiveResult?.summary],
  );
  if (review.isLoading) return <PageLoading label="Loading AI review" />;
  if (review.isError || !review.data)
    return (
      <ErrorState
        message="Unable to load this AI review."
        onRetry={() => review.refetch()}
      />
    );
  const item = review.data;
  const act = async (action: "approve" | "reject" | "retry" | "cancel") => {
    try {
      await transition.mutateAsync(action);
      showToast(`Review ${action}ed`);
    } catch (error) {
      showToast(normalizeApiError(error).message, "error");
    }
  };
  const save = async () => {
    if (!effectiveResult) return;
    try {
      await saveDraft.mutateAsync({
        ...effectiveResult,
        summary,
        coach_notes: item.latest_revision?.coach_notes ?? null,
      });
      setEditing(false);
      showToast("Coach revision saved");
    } catch (error) {
      showToast(normalizeApiError(error).message, "error");
    }
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title={`${formatEnum(item.review_type)} review`}
        description={`Created ${new Date(item.created_at).toLocaleString()}`}
        actions={
          <>
            <Badge
              tone={
                item.status === "approved"
                  ? "green"
                  : item.status === "failed"
                    ? "red"
                    : "amber"
              }
            >
              {formatEnum(item.status)}
            </Badge>
            {item.status === "generated" && (
              <>
                <Button
                  variant="secondary"
                  icon={Edit3}
                  onClick={() => setEditing(true)}
                >
                  Edit summary
                </Button>
                <Button
                  icon={Check}
                  isLoading={transition.isPending}
                  onClick={() => act("approve")}
                >
                  Approve
                </Button>
                <Button
                  variant="secondary"
                  icon={X}
                  onClick={() => act("reject")}
                >
                  Reject
                </Button>
              </>
            )}
            {item.status === "failed" && (
              <Button icon={RotateCcw} onClick={() => act("retry")}>
                Retry
              </Button>
            )}
            {(item.status === "pending" || item.status === "processing") && (
              <Button
                variant="secondary"
                icon={X}
                onClick={() => act("cancel")}
              >
                Cancel
              </Button>
            )}
          </>
        }
      />
      {item.failure_reason && <ErrorState message={item.failure_reason} />}
      {editing && effectiveResult && (
        <Card>
          <label className="block text-sm font-semibold text-ink">
            Coach summary
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              className="mt-1.5 min-h-32 w-full rounded-md border border-line px-3 py-2 font-normal"
            />
          </label>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button icon={Save} isLoading={saveDraft.isPending} onClick={save}>
              Save revision
            </Button>
          </div>
        </Card>
      )}
      {item.status === "generated" ||
      item.status === "approved" ||
      item.status === "rejected" ? (
        <ReviewContent review={item} />
      ) : (
        <Card>
          <p className="font-semibold text-ink">Generation is in progress</p>
          <p className="mt-1 text-sm text-gray-600">
            This page refreshes automatically while the review worker is
            processing the request.
          </p>
        </Card>
      )}
    </div>
  );
}

function ReviewContent({
  review,
}: {
  review: NonNullable<ReturnType<typeof useReview>["data"]>;
}) {
  const result = review.latest_revision ?? review.result;
  if (!result)
    return (
      <Card>
        <p className="text-sm text-gray-600">
          No structured result is available.
        </p>
      </Card>
    );
  return (
    <div className="space-y-5">
      <Card>
        <h2 className="text-lg font-bold text-ink">Summary</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
          {result.summary}
        </p>
      </Card>
      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="font-bold text-ink">Strengths</h2>
          <ul className="mt-3 space-y-3">
            {result.strengths.map((value) => (
              <li key={value.title}>
                <p className="font-semibold text-sm">{value.title}</p>
                <p className="text-sm text-gray-600">{value.description}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-bold text-ink">Improvement areas</h2>
          <ul className="mt-3 space-y-3">
            {result.improvement_areas.map((value) => (
              <li key={value.title}>
                <p className="font-semibold text-sm">{value.title}</p>
                <p className="text-sm text-gray-600">{value.description}</p>
              </li>
            ))}
          </ul>
        </Card>
      </section>
      <Card>
        <h2 className="font-bold text-ink">Recommended drills</h2>
        <div className="mt-3 space-y-4">
          {result.recommended_drills.map((drill) => (
            <div key={drill.name}>
              <p className="font-semibold text-sm">{drill.name}</p>
              <p className="text-sm text-gray-600">{drill.description}</p>
              <p className="mt-1 text-xs text-gray-500">{drill.reason}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="font-bold text-ink">Evidence limitations</h2>
        {"limitations" in result && (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600">
            {result.limitations.map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
