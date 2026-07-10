const labels: Record<string, string> = {
  practice_session_id: "Practice session",
  content_type: "Media type",
  file_size_bytes: "File size",
  review_id: "Review",
  video_id: "Video",
  category: "Category",
  changed: "Updated",
};
export function safeMetadata(
  metadata: Record<string, unknown>,
): Array<{ label: string; value: string }> {
  return Object.entries(metadata).flatMap(([key, value]) => {
    if (
      !(key in labels) ||
      !["string", "number", "boolean"].includes(typeof value)
    )
      return [];
    const formatted =
      key === "file_size_bytes" && typeof value === "number"
        ? `${(value / 1024 / 1024).toFixed(1)} MB`
        : String(value);
    return [{ label: labels[key]!, value: formatted }];
  });
}
