import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { ErrorState, PageLoading } from "../../components/feedback/States";
import { formatDate, formatEnum } from "../../lib/formatters";
import { useAthleteFeedbackDetail } from "../athlete-dashboard/hooks";

export function AthleteFeedbackDetailPage() {
  const { reviewId = "" } = useParams();
  const query = useAthleteFeedbackDetail(reviewId);
  if (query.isLoading) return <PageLoading label="Loading feedback" />;
  if (query.isError || !query.data)
    return (
      <ErrorState
        message="This feedback is unavailable."
        onRetry={() => query.refetch()}
      />
    );
  const feedback = query.data;
  return (
    <div className="space-y-6">
      <Link
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700"
        to="/athlete/feedback"
      >
        <ArrowLeft className="h-4 w-4" /> Back to feedback
      </Link>
      <header>
        <p className="text-sm font-semibold text-brand-700">
          {formatEnum(feedback.review_type)}
        </p>
        <h1 className="mt-1 text-3xl font-bold">Coach feedback</h1>
        <p className="mt-2 text-sm text-gray-500">
          Reviewed and approved by your coach ·{" "}
          {formatDate(feedback.approved_at)}
        </p>
      </header>
      {feedback.athlete_message && (
        <Card className="border-brand-100 bg-brand-50 p-5">
          <p className="text-sm font-semibold text-brand-700">
            Message from your coach
          </p>
          <p className="mt-2 text-lg font-semibold">
            {feedback.athlete_message}
          </p>
        </Card>
      )}
      <Card className="p-5 sm:p-6">
        <h2 className="text-lg font-bold">Summary</h2>
        <p className="mt-3 whitespace-pre-wrap leading-7 text-gray-700">
          {feedback.summary}
        </p>
      </Card>
      {[
        ["Strengths", feedback.strengths],
        ["Improvement areas", feedback.improvement_areas],
        ["Observations", feedback.observations],
      ].map(([title, items]) => (
        <section key={title as string}>
          <h2 className="text-xl font-bold">{title as string}</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {(items as Array<{ title: string; description: string }>).map(
              (item) => (
                <Card key={item.title} className="p-5">
                  <div className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-brand-600" />
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ),
            )}
          </div>
        </section>
      ))}
      <section>
        <h2 className="text-xl font-bold">Recommended drills</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {feedback.recommended_drills.map((drill) => (
            <Card key={drill.name} className="p-5">
              <h3 className="font-semibold">{drill.name}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {drill.description}
              </p>
              <p className="mt-3 text-xs font-semibold uppercase text-gray-500">
                {formatEnum(drill.difficulty)}
                {drill.frequency ? ` · ${drill.frequency}` : ""}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
