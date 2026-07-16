import { Check, Dumbbell, Eye, History, Pencil, X } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { normalizeApiError } from "../../../api/api-client";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import { Dialog } from "../../../components/feedback/Dialog";
import { ErrorState, PageLoading } from "../../../components/feedback/States";
import { useToast } from "../../../components/feedback/Toast";
import { formatEnum } from "../../../lib/formatters";
import { ReviewSections } from "../components/ReviewSections";
import {
  useApproveReview,
  useRejectReview,
  useReview,
} from "../hooks/useReviews";
import type { RejectionCategory, ReviewVisibility } from "../types";

export function ReviewDetailPage() {
  const { reviewId = "" } = useParams();
  const review = useReview(reviewId);
  const approve = useApproveReview(reviewId);
  const reject = useRejectReview(reviewId);
  const { showToast } = useToast();
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [rejectionOpen, setRejectionOpen] = useState(false);
  if (review.isLoading) return <PageLoading label="Loading coach review" />;
  if (review.isError || !review.data)
    return (
      <ErrorState
        message="Unable to load this review."
        onRetry={() => review.refetch()}
      />
    );
  const item = review.data;
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-ink">
              {formatEnum(item.review_type)} review
            </h1>
            <Badge
              tone={
                item.status === "approved"
                  ? "green"
                  : item.status === "rejected"
                    ? "red"
                    : "amber"
              }
            >
              {formatEnum(item.status)}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Generated{" "}
            {item.generated_at
              ? new Date(item.generated_at).toLocaleString()
              : "pending"}{" "}
            · Revision {item.latest_revision_number}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.allowed_actions.can_edit && (
            <Link to={`/reviews/${item.id}/edit`}>
              <Button variant="secondary" icon={Pencil}>
                Edit
              </Button>
            </Link>
          )}
          {item.allowed_actions.can_preview && (
            <Link to={`/reviews/${item.id}/preview`}>
              <Button variant="secondary" icon={Eye}>
                Preview
              </Button>
            </Link>
          )}
          <Link to={`/reviews/${item.id}/history`}>
            <Button variant="secondary" icon={History}>
              History
            </Button>
          </Link>
          {item.status === "approved" && (
            <Link
              to={`/athletes/${item.athlete_id}?tab=drills&assign=review&review_id=${item.id}`}
            >
              <Button variant="secondary" icon={Dumbbell}>
                Assign drills
              </Button>
            </Link>
          )}
          {item.allowed_actions.can_approve && (
            <Button icon={Check} onClick={() => setApprovalOpen(true)}>
              Approve
            </Button>
          )}
          {item.allowed_actions.can_reject && (
            <Button
              variant="danger"
              icon={X}
              onClick={() => setRejectionOpen(true)}
            >
              Reject
            </Button>
          )}
        </div>
      </header>
      {item.approved_snapshot && (
        <div className="space-y-3">
          <Card className="border-green-200 bg-green-50 p-5">
            <p className="font-semibold text-green-900">
              Immutable approved snapshot ·{" "}
              {formatEnum(item.approved_snapshot.visibility)}
            </p>
            <p className="mt-1 text-sm text-green-800">
              Approved{" "}
              {new Date(item.approved_snapshot.approved_at).toLocaleString()}
            </p>
          </Card>
          <section className="panel divide-y divide-line">
            {item.approved_snapshot.recommended_drills.map(
              (recommendation, index) => (
                <div
                  key={`${recommendation.name}-${index}`}
                  className="flex flex-col justify-between gap-3 p-5 sm:flex-row"
                >
                  <div>
                    <p className="font-semibold">{recommendation.name}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {recommendation.description}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      {recommendation.reason}
                    </p>
                  </div>
                  <Link
                    className="shrink-0"
                    to={`/athletes/${item.athlete_id}?tab=drills&assign=review&review_id=${item.id}&recommendation=${index}`}
                  >
                    <Button variant="secondary" icon={Dumbbell}>
                      Assign
                    </Button>
                  </Link>
                </div>
              ),
            )}
          </section>
        </div>
      )}
      {item.result && (
        <section>
          <p className="mb-3 text-xs font-semibold uppercase text-gray-500">
            Original AI output
          </p>
          <ReviewSections
            content={{
              ...item.result,
              observations: item.result.observations.map((observation) => ({
                ...observation,
                coach_verified: observation.coach_verified ?? false,
              })),
            }}
            limitations={item.result.limitations}
          />
        </section>
      )}
      {item.active_draft && (
        <section>
          <p className="mb-3 text-xs font-semibold uppercase text-brand-700">
            {item.active_draft.source === "revision"
              ? `Active coach revision ${item.active_draft.revision_number}`
              : "Active generated draft"}
          </p>
          <ReviewSections content={item.active_draft} />
          <Card>
            <h2 className="font-bold text-ink">Private coach notes</h2>
            <p className="mt-2 text-sm text-gray-600">
              {item.active_draft.coach_notes || "No private notes."}
            </p>
            <h2 className="mt-5 font-bold text-ink">Athlete message</h2>
            <p className="mt-2 text-sm text-gray-600">
              {item.active_draft.athlete_message ||
                "No athlete-facing message."}
            </p>
          </Card>
        </section>
      )}
      <ApprovalDialog
        open={approvalOpen}
        onClose={() => setApprovalOpen(false)}
        revisionNumber={item.latest_revision_number}
        revisionId={item.active_draft?.revision_id}
        athleteMessage={item.active_draft?.athlete_message}
        onApproved={() => {
          setApprovalOpen(false);
          showToast("Review approved");
        }}
        mutation={approve}
      />
      <RejectionDialog
        open={rejectionOpen}
        onClose={() => setRejectionOpen(false)}
        revisionNumber={item.latest_revision_number}
        onRejected={() => {
          setRejectionOpen(false);
          showToast("Review rejected");
        }}
        mutation={reject}
      />
    </div>
  );
}

function ApprovalDialog({
  open,
  onClose,
  revisionNumber,
  revisionId,
  athleteMessage,
  onApproved,
  mutation,
}: {
  open: boolean;
  onClose: () => void;
  revisionNumber: number;
  revisionId?: string | null;
  athleteMessage?: string | null;
  onApproved: () => void;
  mutation: ReturnType<typeof useApproveReview>;
}) {
  const [visibility, setVisibility] = useState<ReviewVisibility>("coach_only");
  const [message, setMessage] = useState(athleteMessage ?? "");
  const [confirmed, setConfirmed] = useState(false);
  const { showToast } = useToast();
  const submit = async () => {
    try {
      await mutation.mutateAsync({
        revision_id: revisionId,
        expected_revision_number: revisionNumber,
        visibility,
        athlete_message: message || null,
        confirmation: confirmed,
      });
      onApproved();
    } catch (error) {
      showToast(normalizeApiError(error).message, "error");
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Approve immutable snapshot"
      description="Approval locks this review and creates the athlete-facing snapshot."
    >
      <div className="space-y-4">
        <fieldset>
          <legend className="text-sm font-semibold text-ink">Visibility</legend>
          <label className="mt-2 flex gap-2 text-sm">
            <input
              type="radio"
              checked={visibility === "coach_only"}
              onChange={() => setVisibility("coach_only")}
            />
            Coach only
          </label>
          <label className="mt-2 flex gap-2 text-sm">
            <input
              type="radio"
              checked={visibility === "athlete_visible"}
              onChange={() => setVisibility("athlete_visible")}
            />
            Visible to athlete
          </label>
        </fieldset>
        <label className="block text-sm font-semibold">
          Athlete message
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="mt-1 w-full rounded-md border border-line px-3 py-2 font-normal"
          />
        </label>
        <label className="flex gap-2 text-sm">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
          />
          I understand approval creates an immutable snapshot.
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            isLoading={mutation.isPending}
            disabled={!confirmed}
            onClick={submit}
          >
            Approve review
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
function RejectionDialog({
  open,
  onClose,
  revisionNumber,
  onRejected,
  mutation,
}: {
  open: boolean;
  onClose: () => void;
  revisionNumber: number;
  onRejected: () => void;
  mutation: ReturnType<typeof useRejectReview>;
}) {
  const [category, setCategory] = useState<RejectionCategory | "">("");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const { showToast } = useToast();
  const submit = async () => {
    if (!category) return;
    try {
      await mutation.mutateAsync({
        category,
        reason: reason || null,
        expected_revision_number: revisionNumber,
        confirmation: confirmed,
      });
      onRejected();
    } catch (error) {
      showToast(normalizeApiError(error).message, "error");
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Reject AI draft"
      description="Rejection is final for this draft and remains coach-only."
    >
      <div className="space-y-4">
        <label className="block text-sm font-semibold">
          Reason category
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as RejectionCategory)
            }
            className="mt-1 w-full rounded-md border border-line px-3 py-2 font-normal"
          >
            <option value="">Select a category</option>
            {[
              "inaccurate",
              "insufficient",
              "unsafe",
              "irrelevant",
              "too_generic",
              "inadequate_context",
              "other",
            ].map((value) => (
              <option key={value}>{value.replace(/_/g, " ")}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Private reason
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="mt-1 w-full rounded-md border border-line px-3 py-2 font-normal"
          />
        </label>
        <label className="flex gap-2 text-sm">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
          />
          I understand this draft cannot be edited after rejection.
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={mutation.isPending}
            disabled={!confirmed || !category}
            onClick={submit}
          >
            Reject review
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
