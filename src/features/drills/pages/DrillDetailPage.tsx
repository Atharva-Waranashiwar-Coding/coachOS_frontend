import { Archive, Pencil, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { normalizeApiError } from "../../../api/api-client";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import { PageHeader } from "../../../components/common/PageHeader";
import { ConfirmDialog } from "../../../components/feedback/Dialog";
import { ErrorState, PageLoading } from "../../../components/feedback/States";
import { useToast } from "../../../components/feedback/Toast";
import { formatEnum } from "../../../lib/formatters";
import { useArchiveDrill, useDrill, useRestoreDrill } from "../hooks/useDrills";

export function DrillDetailPage() {
  const { drillId = "" } = useParams();
  const [confirmArchive, setConfirmArchive] = useState(false);
  const query = useDrill(drillId);
  const archive = useArchiveDrill();
  const restore = useRestoreDrill();
  const { showToast } = useToast();
  if (query.isLoading) return <PageLoading label="Loading drill" />;
  if (query.isError || !query.data)
    return (
      <ErrorState
        message={normalizeApiError(query.error).message}
        onRetry={() => query.refetch()}
      />
    );
  const drill = query.data;
  const changeStatus = async () => {
    try {
      if (drill.status === "active") await archive.mutateAsync(drill.id);
      else await restore.mutateAsync(drill.id);
      showToast(
        drill.status === "active" ? "Drill archived" : "Drill restored",
      );
      setConfirmArchive(false);
    } catch (error) {
      showToast(normalizeApiError(error).message, "error");
    }
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title={drill.title}
        description={`${formatEnum(drill.category)} · ${formatEnum(drill.difficulty)}`}
        actions={
          drill.status === "active" ? (
            <>
              <Link to={`/drills/${drill.id}/edit`}>
                <Button variant="secondary" icon={Pencil}>
                  Edit
                </Button>
              </Link>
              <Button
                variant="danger"
                icon={Archive}
                onClick={() => setConfirmArchive(true)}
              >
                Archive
              </Button>
            </>
          ) : (
            <Button
              icon={RotateCcw}
              isLoading={restore.isPending}
              onClick={changeStatus}
            >
              Restore
            </Button>
          )
        }
      />
      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-5">
          <Card className="p-5">
            <h2 className="font-bold">Instructions</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
              {drill.instructions}
            </p>
            {drill.description && (
              <>
                <h2 className="mt-6 font-bold">Description</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {drill.description}
                </p>
              </>
            )}
          </Card>
        </section>
        <aside className="panel p-5">
          <h2 className="font-bold">Defaults</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <Detail
              label="Duration"
              value={
                drill.estimated_duration_minutes
                  ? `${drill.estimated_duration_minutes} minutes`
                  : "Not set"
              }
            />
            <Detail
              label="Sets"
              value={drill.default_sets?.toString() ?? "Not set"}
            />
            <Detail
              label="Repetitions"
              value={drill.default_repetitions?.toString() ?? "Not set"}
            />
            <Detail
              label="Frequency"
              value={drill.default_frequency ?? "Not set"}
            />
            <Detail
              label="Equipment"
              value={drill.equipment.join(", ") || "None"}
            />
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            {drill.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        </aside>
      </div>
      <ConfirmDialog
        open={confirmArchive}
        onClose={() => setConfirmArchive(false)}
        onConfirm={changeStatus}
        title="Archive drill?"
        description="Existing assignments remain valid, but this drill cannot be assigned again until restored."
        confirmLabel="Archive drill"
        destructive
        isPending={archive.isPending}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-gray-500">{label}</dt>
      <dd className="mt-1 text-gray-800">{value}</dd>
    </div>
  );
}
