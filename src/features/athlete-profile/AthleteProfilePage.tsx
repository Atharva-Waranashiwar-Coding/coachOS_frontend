import { Card } from "../../components/common/Card";
import { ErrorState, PageLoading } from "../../components/feedback/States";
import { formatEnum } from "../../lib/formatters";
import { useAthleteMe } from "../athlete-dashboard/hooks";

export function AthleteProfilePage() {
  const query = useAthleteMe();
  if (query.isLoading) return <PageLoading label="Loading profile" />;
  if (query.isError || !query.data)
    return (
      <ErrorState
        message="Your profile could not be loaded."
        onRetry={() => query.refetch()}
      />
    );
  const athlete = query.data;
  const details = [
    ["Name", `${athlete.first_name} ${athlete.last_name}`],
    ["Preferred name", athlete.preferred_name],
    ["Primary position", formatEnum(athlete.primary_position)],
    [
      "Secondary positions",
      athlete.secondary_positions.map(formatEnum).join(", "),
    ],
    ["Bats", formatEnum(athlete.bats)],
    ["Throws", formatEnum(athlete.throws)],
    ["Graduation year", athlete.graduation_year],
    ["School", athlete.school_name],
    ["Team", athlete.team_name],
  ];
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-2 text-gray-600">Your shared playing profile.</p>
      </header>
      <Card className="p-5 sm:p-6">
        <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {details.map(([label, value]) => (
            <div key={String(label)}>
              <dt className="text-xs font-semibold uppercase text-gray-500">
                {label}
              </dt>
              <dd className="mt-1.5 font-medium">{value || "Not provided"}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
