export function formatDate(value?: string | null): string {
  if (!value) return "Not provided";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatEnum(value?: string | null): string {
  if (!value) return "Not provided";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character: string) => character.toUpperCase());
}

export function athleteName(athlete: {
  first_name: string;
  last_name: string;
  preferred_name?: string | null;
}): string {
  return `${athlete.first_name} ${athlete.last_name}${athlete.preferred_name ? ` (${athlete.preferred_name})` : ""}`;
}
