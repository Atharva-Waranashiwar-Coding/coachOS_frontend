import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { normalizeApiError } from "../../../api/api-client";
import { PageHeader } from "../../../components/common/PageHeader";
import { ErrorState, PageLoading } from "../../../components/feedback/States";
import { useToast } from "../../../components/feedback/Toast";
import type { ApiError } from "../../../types/api";
import { AthleteForm } from "../components/AthleteForm";
import { useAthlete, useUpdateAthlete } from "../hooks/useAthletes";
import type { AthleteFormOutput } from "../schemas/athlete.schema";
export function AthleteEditPage() {
  const { athleteId = "" } = useParams();
  const query = useAthlete(athleteId);
  const update = useUpdateAthlete(athleteId);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [error, setError] = useState<ApiError | null>(null);
  if (query.isLoading) return <PageLoading label="Loading athlete" />;
  if (query.isError)
    return (
      <ErrorState
        message={normalizeApiError(query.error).message}
        onRetry={() => query.refetch()}
      />
    );
  if (!query.data) return <PageLoading label="Loading athlete" />;
  const submit = async (values: AthleteFormOutput) => {
    try {
      setError(null);
      await update.mutateAsync(values);
      showToast("Athlete profile updated");
      navigate(`/athletes/${athleteId}`);
    } catch (caught) {
      setError(normalizeApiError(caught));
    }
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${query.data.first_name} ${query.data.last_name}`}
        description="Update profile, program, and coaching information."
      />
      <AthleteForm
        athlete={query.data}
        onSubmit={submit}
        isPending={update.isPending}
        apiError={error}
      />
    </div>
  );
}
