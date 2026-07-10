import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { normalizeApiError } from "../../../api/api-client";
import { PageHeader } from "../../../components/common/PageHeader";
import { useToast } from "../../../components/feedback/Toast";
import { AthleteForm } from "../components/AthleteForm";
import { useCreateAthlete } from "../hooks/useAthletes";
import type { AthleteFormOutput } from "../schemas/athlete.schema";
import type { ApiError } from "../../../types/api";
export function AthleteCreatePage() {
  const create = useCreateAthlete();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [error, setError] = useState<ApiError | null>(null);
  const submit = async (values: AthleteFormOutput) => {
    try {
      setError(null);
      const athlete = await create.mutateAsync(values);
      showToast("Athlete created");
      navigate(`/athletes/${athlete.id}`);
    } catch (caught) {
      setError(normalizeApiError(caught));
    }
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add athlete"
        description="Create a profile and connect it to your coaching workspace."
      />
      <AthleteForm
        onSubmit={submit}
        isPending={create.isPending}
        apiError={error}
      />
    </div>
  );
}
