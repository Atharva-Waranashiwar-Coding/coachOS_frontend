import { Archive, ChartNoAxesCombined, Edit3, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { normalizeApiError } from "../../../api/api-client";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { PageHeader } from "../../../components/common/PageHeader";
import { ConfirmDialog } from "../../../components/feedback/Dialog";
import { ErrorState, PageLoading } from "../../../components/feedback/States";
import { useToast } from "../../../components/feedback/Toast";
import { athleteName, formatEnum } from "../../../lib/formatters";
import { GoalsPanel } from "../../goals/components/GoalsPanel";
import { DrillAssignmentsPanel } from "../../drills/components/DrillAssignmentsPanel";
import { TimelinePanel } from "../../timeline/components/TimelinePanel";
import { AthleteOverview } from "../components/AthleteOverview";
import {
  useArchiveAthlete,
  useAthlete,
  useRestoreAthlete,
} from "../hooks/useAthletes";

type Tab = "overview" | "goals" | "drills" | "timeline";
export function AthleteProfilePage() {
  const { athleteId = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = (["overview", "goals", "drills", "timeline"] as const).includes(
    params.get("tab") as Tab,
  )
    ? (params.get("tab") as Tab)
    : "overview";
  const [confirmArchive, setConfirmArchive] = useState(false);
  const query = useAthlete(athleteId);
  const archive = useArchiveAthlete(athleteId);
  const restore = useRestoreAthlete(athleteId);
  const { showToast } = useToast();
  if (query.isLoading) return <PageLoading label="Loading athlete profile" />;
  if (query.isError) {
    const error = normalizeApiError(query.error);
    return (
      <ErrorState
        message={
          error.status === 404
            ? "This athlete does not exist or is not assigned to you."
            : error.message
        }
        onRetry={error.status === 404 ? undefined : () => query.refetch()}
      />
    );
  }
  if (!query.data) return <PageLoading label="Loading athlete profile" />;
  const athlete = query.data;
  const mutate = async (action: "archive" | "restore") => {
    try {
      if (action === "archive") await archive.mutateAsync();
      else await restore.mutateAsync();
      showToast(action === "archive" ? "Athlete archived" : "Athlete restored");
      setConfirmArchive(false);
    } catch (error) {
      showToast(normalizeApiError(error).message, "error");
    }
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title={athleteName(athlete)}
        description={`${formatEnum(athlete.primary_position)} · ${athlete.team_name ?? athlete.school_name ?? "No program listed"}`}
        actions={
          <>
            <Badge
              tone={
                athlete.status === "active"
                  ? "green"
                  : athlete.status === "archived"
                    ? "red"
                    : "amber"
              }
            >
              {formatEnum(athlete.status)}
            </Badge>
            <Link to={`/athletes/${athlete.id}/edit`}>
              <Button variant="secondary" icon={Edit3}>
                Edit
              </Button>
            </Link>
            <Link to={`/athletes/${athlete.id}/insights`}>
              <Button variant="secondary" icon={ChartNoAxesCombined}>
                Insights
              </Button>
            </Link>
            {athlete.status === "archived" ? (
              <Button
                icon={RotateCcw}
                isLoading={restore.isPending}
                onClick={() => mutate("restore")}
              >
                Restore
              </Button>
            ) : (
              <Button
                variant="danger"
                icon={Archive}
                onClick={() => setConfirmArchive(true)}
              >
                Archive
              </Button>
            )}
          </>
        }
      />
      <nav
        className="flex gap-1 overflow-x-auto border-b border-line"
        aria-label="Athlete profile sections"
      >
        {(["overview", "goals", "drills", "timeline"] as const).map((value) => (
          <button
            key={value}
            className={`min-h-11 border-b-2 px-4 text-sm font-semibold capitalize ${tab === value ? "border-brand-600 text-brand-700" : "border-transparent text-gray-500 hover:text-ink"}`}
            onClick={() =>
              setParams(value === "overview" ? {} : { tab: value })
            }
          >
            {value}
          </button>
        ))}
      </nav>
      {tab === "overview" && <AthleteOverview athlete={athlete} />}
      {tab === "goals" && <GoalsPanel athleteId={athleteId} />}
      {tab === "drills" && <DrillAssignmentsPanel athleteId={athleteId} />}
      {tab === "timeline" && <TimelinePanel athleteId={athleteId} />}
      <ConfirmDialog
        open={confirmArchive}
        onClose={() => setConfirmArchive(false)}
        title="Archive athlete?"
        description="The athlete will be removed from active views. Their profile, goals, and timeline history will remain available and can be restored."
        confirmLabel="Archive athlete"
        destructive
        isPending={archive.isPending}
        onConfirm={() => mutate("archive")}
      />
    </div>
  );
}
