import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Film, Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import * as media from "../../api/media.api";
import { normalizeApiError } from "../../api/api-client";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import {
  EmptyState,
  ErrorState,
  PageLoading,
} from "../../components/feedback/States";
import { FormField, Input, Select } from "../../components/forms/Fields";
import { useAthletes } from "../athletes/hooks/useAthletes";
import type { SessionType } from "./types";

const sessionTypes: SessionType[] = [
  "practice",
  "game",
  "bullpen",
  "batting",
  "fielding",
  "strength",
  "assessment",
  "other",
];

export function VideosPage() {
  const client = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const sessions = useQuery({
    queryKey: ["media", "sessions"],
    queryFn: media.listSessions,
  });
  const athletes = useAthletes({
    page: 1,
    page_size: 100,
    status: "active",
    sort_by: "first_name",
    sort_order: "asc",
  });
  const videos = useQuery({
    queryKey: ["media", "sessions", selected, "videos"],
    queryFn: () => media.listSessionVideos(selected),
    enabled: Boolean(selected),
  });
  const create = useMutation({
    mutationFn: media.createSession,
    onSuccess: async (session) => {
      setCreating(false);
      setSelected(session.id);
      await client.invalidateQueries({ queryKey: ["media", "sessions"] });
    },
  });

  async function upload(sessionId: string, file?: File) {
    if (!file) return;
    setError("");
    setProgress(0);
    try {
      const ticket = await media.requestUpload(sessionId, file);
      await media.uploadFile(ticket, file, setProgress);
      await media.completeUpload(ticket.video_id);
      setProgress(null);
      await client.invalidateQueries({
        queryKey: ["media", "sessions", sessionId, "videos"],
      });
    } catch (cause) {
      setProgress(null);
      setError(
        cause instanceof Error
          ? cause.message
          : normalizeApiError(cause).message,
      );
    }
  }

  if (sessions.isLoading || athletes.isLoading)
    return <PageLoading label="Loading videos" />;
  if (sessions.isError)
    return (
      <ErrorState
        message={normalizeApiError(sessions.error).message}
        onRetry={() => sessions.refetch()}
      />
    );
  const activeSession = sessions.data?.items.find(
    (item) => item.id === selected,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Videos</h1>
          <p className="mt-1 text-sm text-gray-600">
            Upload private practice footage and prepare it for coaching review.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setCreating((value) => !value)}>
          New session
        </Button>
      </div>
      {error && (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}
      {creating && (
        <SessionForm
          athletes={athletes.data?.items ?? []}
          busy={create.isPending}
          error={create.error ? normalizeApiError(create.error).message : ""}
          onSubmit={(payload) => create.mutate(payload)}
        />
      )}
      {!sessions.data?.items.length ? (
        <EmptyState
          title="No practice sessions yet"
          description="Create a session, choose an athlete, and upload the first video."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(280px,0.8fr)_1.2fr]">
          <Card className="divide-y divide-line overflow-hidden p-0">
            {sessions.data.items.map((session) => (
              <button
                key={session.id}
                className={`w-full p-4 text-left hover:bg-gray-50 ${selected === session.id ? "bg-brand-50" : ""}`}
                onClick={() => setSelected(session.id)}
              >
                <div className="font-semibold text-ink">{session.title}</div>
                <div className="mt-1 text-xs capitalize text-gray-500">
                  {session.session_type} ·{" "}
                  {new Date(session.session_date).toLocaleDateString()} ·{" "}
                  {session.status}
                </div>
              </button>
            ))}
          </Card>
          {activeSession ? (
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{activeSession.title}</h2>
                  <p className="text-sm text-gray-500">
                    MP4, MOV, or WebM · up to 2 GB
                  </p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white">
                  <Upload className="h-4 w-4" />
                  Upload video
                  <input
                    className="sr-only"
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    disabled={progress !== null}
                    onChange={(event) =>
                      void upload(activeSession.id, event.target.files?.[0])
                    }
                  />
                </label>
              </div>
              {progress !== null && (
                <div className="mt-5">
                  <div className="mb-1 text-sm">Uploading… {progress}%</div>
                  <div className="h-2 overflow-hidden rounded bg-gray-200">
                    <div
                      className="h-full bg-brand-600"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="mt-5 space-y-3">
                {videos.isLoading ? (
                  <PageLoading label="Loading session videos" />
                ) : !videos.data?.items.length ? (
                  <p className="rounded-md bg-gray-50 p-5 text-center text-sm text-gray-500">
                    No videos uploaded to this session.
                  </p>
                ) : (
                  videos.data.items.map((video) => (
                    <div
                      key={video.id}
                      className="flex items-center gap-3 rounded-md border border-line p-3"
                    >
                      <Film className="h-5 w-5 text-brand-600" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {video.original_filename}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(video.file_size_bytes / 1024 / 1024).toFixed(1)} MB
                          · {video.upload_status}
                        </p>
                      </div>
                      {video.upload_status === "uploaded" && (
                        <Link
                          className="text-sm font-semibold text-brand-700"
                          to={`/videos/${video.id}/athletes/${video.athlete_id}/reviews/new`}
                        >
                          Start AI review
                        </Link>
                      )}
                      <button
                        aria-label={`Delete ${video.original_filename}`}
                        onClick={async () => {
                          await media.deleteVideo(video.id);
                          await videos.refetch();
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          ) : (
            <EmptyState
              title="Select a session"
              description="Choose a session to view and upload its videos."
            />
          )}
        </div>
      )}
    </div>
  );
}

function SessionForm({
  athletes,
  busy,
  error,
  onSubmit,
}: {
  athletes: Array<{ id: string; first_name: string; last_name: string }>;
  busy: boolean;
  error: string;
  onSubmit: (payload: {
    athlete_id: string;
    title: string;
    session_date: string;
    session_type: SessionType;
  }) => void;
}) {
  return (
    <Card>
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          onSubmit({
            athlete_id: String(data.get("athlete_id")),
            title: String(data.get("title")),
            session_date: new Date(
              String(data.get("session_date")),
            ).toISOString(),
            session_type: String(data.get("session_type")) as SessionType,
          });
        }}
      >
        {error && (
          <div className="md:col-span-2 text-sm text-red-600" role="alert">
            {error}
          </div>
        )}
        <FormField label="Athlete" htmlFor="video-athlete">
          <Select id="video-athlete" name="athlete_id" required>
            <option value="">Select athlete</option>
            {athletes.map((athlete) => (
              <option key={athlete.id} value={athlete.id}>
                {athlete.first_name} {athlete.last_name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Session title" htmlFor="video-title">
          <Input
            id="video-title"
            name="title"
            required
            placeholder="Bullpen mechanics"
          />
        </FormField>
        <FormField label="Date and time" htmlFor="video-date">
          <Input
            id="video-date"
            name="session_date"
            type="datetime-local"
            required
          />
        </FormField>
        <FormField label="Session type" htmlFor="video-type">
          <Select id="video-type" name="session_type">
            {sessionTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace("_", " ")}
              </option>
            ))}
          </Select>
        </FormField>
        <div className="md:col-span-2">
          <Button type="submit" isLoading={busy}>
            Create session
          </Button>
        </div>
      </form>
    </Card>
  );
}
