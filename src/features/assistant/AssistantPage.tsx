import { LoaderCircle, MessageCircle, Send, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { archiveAssistantConversation, askAssistant, getAssistantConversation, listAssistantConversations, type AssistantMessage, type Conversation } from "../../api/assistant.api";
import { normalizeApiError } from "../../api/api-client";
import { Button } from "../../components/common/Button";

export function AssistantPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>();
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const refresh = () => listAssistantConversations().then(setConversations).catch(() => undefined);
  useEffect(() => { refresh(); }, []);
  async function open(id: string) {
    setActiveId(id); setError(undefined);
    try { setMessages((await getAssistantConversation(id)).messages); } catch (cause) { setError(normalizeApiError(cause).message); }
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); const value = question.trim(); if (!value || loading) return;
    setQuestion(""); setError(undefined); setLoading(true);
    setMessages((current) => [...current, { role: "user", content: value }]);
    try {
      const result = await askAssistant({ question: value, conversation_id: activeId });
      setActiveId(result.conversation_id);
      setMessages((current) => [...current, { role: "assistant", content: result.answer, citations: { items: result.citations } }]);
      refresh();
    } catch (cause) { setError(normalizeApiError(cause).message); setMessages((current) => current.slice(0, -1)); }
    finally { setLoading(false); }
  }
  async function remove(id: string) {
    await archiveAssistantConversation(id); if (id === activeId) { setActiveId(undefined); setMessages([]); } refresh();
  }
  return <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
    <aside className="panel h-fit p-3"><Button variant="secondary" className="mb-3 w-full" onClick={() => { setActiveId(undefined); setMessages([]); }}>New conversation</Button>
      <div className="space-y-1">{conversations.map((item) => <div key={item.id} className={`group flex items-center rounded-md ${item.id === activeId ? "bg-brand-50" : "hover:bg-gray-50"}`}><button className="min-w-0 flex-1 truncate px-3 py-2 text-left text-sm" onClick={() => open(item.id)}>{item.title}</button><button className="p-2 text-gray-400 opacity-0 group-hover:opacity-100" aria-label={`Archive ${item.title}`} onClick={() => remove(item.id)}><Trash2 className="h-4 w-4" /></button></div>)}</div>
    </aside>
    <section className="panel flex min-h-[580px] flex-col">
      <div className="border-b border-line p-5"><h1 className="flex items-center gap-2 text-lg font-bold"><MessageCircle className="h-5 w-5 text-brand-600" />Grounded coaching assistant</h1><p className="mt-1 text-sm text-gray-600">Answers use your CoachOS records and show their supporting sources.</p></div>
      <div className="flex-1 space-y-5 p-5">{messages.length === 0 && <p className="rounded-md bg-brand-50 p-4 text-sm text-brand-800">Ask about athlete goals, approved reviews, drills, practice sessions, or timeline events.</p>}
        {messages.map((message, index) => <article key={index} className={message.role === "user" ? "ml-auto max-w-[80%] rounded-lg bg-brand-600 p-3 text-sm text-white" : "max-w-[90%] rounded-lg bg-gray-100 p-3 text-sm text-ink"}><p className="whitespace-pre-wrap">{message.content}</p>{message.citations?.items?.length ? <div className="mt-3 border-t border-gray-300 pt-2 text-xs text-gray-600">Sources: {message.citations.items.map((citation) => `${citation.entity_type.replace(/_/g, " ")} (${Math.round(citation.confidence * 100)}%)`).join(" · ")}</div> : null}</article>)}
        {loading && <LoaderCircle className="h-5 w-5 animate-spin text-brand-600" />}{error && <p className="text-sm text-red-700">{error}</p>}</div>
      <form className="flex gap-2 border-t border-line p-4" onSubmit={submit}><label className="sr-only" htmlFor="assistant-question">Ask CoachOS Assistant</label><input id="assistant-question" className="control" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a question about your coaching workspace…" /><Button type="submit" icon={Send} isLoading={loading}>Send</Button></form>
    </section>
  </div>;
}
