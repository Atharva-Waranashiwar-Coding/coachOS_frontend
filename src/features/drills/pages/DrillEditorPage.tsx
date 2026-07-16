import { useNavigate, useParams } from "react-router-dom";
import { normalizeApiError } from "../../../api/api-client";
import { Card } from "../../../components/common/Card";
import { PageHeader } from "../../../components/common/PageHeader";
import { ErrorState, PageLoading } from "../../../components/feedback/States";
import { useToast } from "../../../components/feedback/Toast";
import { DrillForm } from "../components/DrillForm";
import { useCreateDrill, useDrill, useUpdateDrill } from "../hooks/useDrills";
import type { DrillPayload } from "../types";

export function DrillEditorPage() {
  const { drillId = "" } = useParams();
  const editing = Boolean(drillId);
  const query = useDrill(drillId);
  const create = useCreateDrill();
  const update = useUpdateDrill(drillId);
  const navigate = useNavigate();
  const { showToast } = useToast();
  if (editing && query.isLoading) return <PageLoading label="Loading drill" />;
  if (editing && (query.isError || !query.data))
    return (
      <ErrorState
        message={normalizeApiError(query.error).message}
        onRetry={() => query.refetch()}
      />
    );
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={editing ? "Edit drill" : "Create drill"}
        description="Library changes never rewrite existing athlete assignment snapshots."
      />
      <Card className="p-5 sm:p-6">
        <DrillForm
          drill={query.data}
          isPending={create.isPending || update.isPending}
          onSubmit={async (values) => {
            try {
              const drill = editing
                ? await update.mutateAsync(values as Partial<DrillPayload>)
                : await create.mutateAsync(values as DrillPayload);
              showToast(editing ? "Drill updated" : "Drill created");
              navigate(`/drills/${drill.id}`);
            } catch (error) {
              showToast(normalizeApiError(error).message, "error");
            }
          }}
        />
      </Card>
    </div>
  );
}
