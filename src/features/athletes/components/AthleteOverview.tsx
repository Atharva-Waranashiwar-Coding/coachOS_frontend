import { ShieldAlert } from "lucide-react";
import { Card } from "../../../components/common/Card";
import {
  formatDate,
  formatDateTime,
  formatEnum,
} from "../../../lib/formatters";
import type { AthleteDetail } from "../types";

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-gray-500">{label}</dt>
      <dd className="mt-1.5 text-sm text-ink">{value || "Not provided"}</dd>
    </div>
  );
}
export function AthleteOverview({ athlete }: { athlete: AthleteDetail }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
      <div className="space-y-5">
        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-bold">Profile</h2>
          <dl className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <Detail
              label="Full name"
              value={`${athlete.first_name} ${athlete.last_name}`}
            />
            <Detail label="Preferred name" value={athlete.preferred_name} />
            <Detail
              label="Date of birth"
              value={formatDate(athlete.date_of_birth)}
            />
            <Detail label="Email" value={athlete.email} />
            <Detail label="Phone" value={athlete.phone} />
            <Detail label="Status" value={formatEnum(athlete.status)} />
          </dl>
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-bold">Playing profile</h2>
          <dl className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <Detail
              label="Primary position"
              value={formatEnum(athlete.primary_position)}
            />
            <Detail
              label="Secondary positions"
              value={
                athlete.secondary_positions.length
                  ? athlete.secondary_positions.map(formatEnum).join(", ")
                  : null
              }
            />
            <Detail label="Bats" value={formatEnum(athlete.bats)} />
            <Detail label="Throws" value={formatEnum(athlete.throws)} />
            <Detail label="Graduation year" value={athlete.graduation_year} />
            <Detail label="School" value={athlete.school_name} />
            <Detail label="Team" value={athlete.team_name} />
            <Detail
              label="Height"
              value={
                athlete.height_inches ? `${athlete.height_inches} in` : null
              }
            />
            <Detail
              label="Weight"
              value={
                athlete.weight_pounds ? `${athlete.weight_pounds} lb` : null
              }
            />
          </dl>
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-bold">General notes</h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700">
            {athlete.general_notes || "No general notes recorded."}
          </p>
        </Card>
      </div>
      <aside className="space-y-5">
        <Card className="border-amber-200 bg-amber-50/50 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-700" />
            <h2 className="font-bold text-amber-950">
              Sensitive injury information
            </h2>
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-amber-950/80">
            {athlete.injury_notes || "No injury notes recorded."}
          </p>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">Record history</h2>
          <dl className="mt-4 space-y-4">
            <Detail
              label="Created"
              value={formatDateTime(athlete.created_at)}
            />
            <Detail
              label="Last updated"
              value={formatDateTime(athlete.updated_at)}
            />
            {athlete.archived_at && (
              <Detail
                label="Archived"
                value={formatDateTime(athlete.archived_at)}
              />
            )}
          </dl>
        </Card>
      </aside>
    </div>
  );
}
