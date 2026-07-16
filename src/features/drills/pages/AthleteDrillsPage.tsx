import { useParams } from "react-router-dom";
import { PageHeader } from "../../../components/common/PageHeader";
import { DrillAssignmentsPanel } from "../components/DrillAssignmentsPanel";

export function AthleteDrillsPage() {
  const { athleteId = "" } = useParams();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Athlete drills"
        description="Manage explicit drill assignments and their lifecycle."
      />
      <DrillAssignmentsPanel athleteId={athleteId} />
    </div>
  );
}
