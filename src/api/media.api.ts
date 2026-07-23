import { mediaClient } from "./api-client";
import type {
  PracticeSession,
  SessionList,
  SessionType,
  UploadTicket,
  VideoList,
  VideoSummary,
} from "../features/videos/types";

export async function listSessions(): Promise<SessionList> {
  return (
    await mediaClient.get<SessionList>("/api/v1/practice-sessions", {
      params: { page_size: 100 },
    })
  ).data;
}
export async function createSession(payload: {
  athlete_id: string;
  title: string;
  session_date: string;
  session_type: SessionType;
}): Promise<PracticeSession> {
  return (
    await mediaClient.post<PracticeSession>(
      "/api/v1/practice-sessions",
      payload,
    )
  ).data;
}
export async function listSessionVideos(id: string): Promise<VideoList> {
  return (
    await mediaClient.get<VideoList>(`/api/v1/practice-sessions/${id}/videos`)
  ).data;
}
export async function requestUpload(
  id: string,
  file: File,
): Promise<UploadTicket> {
  return (
    await mediaClient.post<UploadTicket>(
      `/api/v1/practice-sessions/${id}/videos/upload-url`,
      {
        filename: file.name,
        content_type: file.type,
        file_size_bytes: file.size,
      },
    )
  ).data;
}
export function uploadFile(
  ticket: UploadTicket,
  file: File,
  onProgress: (value: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", ticket.upload_url);
    Object.entries(ticket.required_headers).forEach(([key, value]) =>
      request.setRequestHeader(key, value),
    );
    request.upload.onprogress = (event) =>
      event.lengthComputable &&
      onProgress(Math.round((event.loaded / event.total) * 100));
    request.onload = () =>
      request.status >= 200 && request.status < 300
        ? resolve()
        : reject(new Error("Storage rejected the upload."));
    request.onerror = () =>
      reject(new Error("The upload could not reach storage."));
    request.send(file);
  });
}
export async function completeUpload(id: string): Promise<VideoSummary> {
  return (
    await mediaClient.post<VideoSummary>(
      `/api/v1/videos/${id}/complete-upload`,
      {},
    )
  ).data;
}
export async function deleteVideo(id: string): Promise<void> {
  await mediaClient.delete(`/api/v1/videos/${id}`);
}
