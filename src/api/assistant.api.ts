import { assistantClient } from "./api-client";

export interface AssistantCitation {
  chunk_id: string;
  entity_type: string;
  entity_id: string;
  athlete_id: string | null;
  confidence: number;
}

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
  citations?: { items?: AssistantCitation[] };
}

export interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

export async function askAssistant(payload: { question: string; conversation_id?: string; athlete_id?: string }) {
  const { data } = await assistantClient.post<{ conversation_id: string; answer: string; citations: AssistantCitation[]; suggested_follow_ups: string[] }>("/api/v1/chat", payload);
  return data;
}

export async function listAssistantConversations() {
  const { data } = await assistantClient.get<Conversation[]>("/api/v1/conversations");
  return data;
}

export async function getAssistantConversation(id: string) {
  const { data } = await assistantClient.get<{ id: string; title: string; messages: AssistantMessage[] }>(`/api/v1/conversations/${id}`);
  return data;
}

export async function archiveAssistantConversation(id: string) {
  await assistantClient.delete(`/api/v1/conversations/${id}`);
}
