import { BrainCircuit } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { normalizeApiError } from "../../../api/api-client";
import { Button } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import { PageHeader } from "../../../components/common/PageHeader";
import { useToast } from "../../../components/feedback/Toast";
import { useCreateReview } from "../hooks/useReviews";
import type { ReviewType } from "../types";

const types: ReviewType[] = [
  "general",
  "hitting",
  "pitching",
  "fielding",
  "throwing",
  "footwork",
  "mobility",
  "strength",
  "decision_making",
];
const lines = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

export function NewReviewPage() {
  const { athleteId = "", videoId = "" } = useParams();
  const navigate = useNavigate();
  const create = useCreateReview();
  const { showToast } = useToast();
  const [selectedAthleteId, setSelectedAthleteId] = useState(athleteId);
  const [sessionId, setSessionId] = useState("");
  const [reviewType, setReviewType] = useState<ReviewType>("general");
  const [coachContext, setCoachContext] = useState("");
  const [objectives, setObjectives] = useState("");
  const [focus, setFocus] = useState("");
  const [observations, setObservations] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await create.mutateAsync({
        athlete_id: selectedAthleteId,
        practice_session_id: sessionId,
        video_id: videoId,
        review_type: reviewType,
        coach_context: coachContext || undefined,
        session_objectives: lines(objectives),
        requested_focus_areas: lines(focus),
        manual_observations: lines(observations),
        frame_observations: [],
      });
      navigate(`/reviews/${response.review_id}`);
    } catch (error) {
      showToast(normalizeApiError(error).message, "error");
    }
  };
  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="New AI review"
        description="Generate a bounded coaching draft from uploaded-video metadata and the context you provide."
      />
      <Card>
        <form className="space-y-5" onSubmit={submit}>
          {!athleteId && (
            <label className="block text-sm font-semibold text-ink">
              Athlete ID
              <input
                required
                value={selectedAthleteId}
                onChange={(event) => setSelectedAthleteId(event.target.value)}
                className="mt-1.5 w-full rounded-md border border-line px-3 py-2"
                placeholder="Athlete UUID"
              />
            </label>
          )}
          <label className="block text-sm font-semibold text-ink">
            Practice session ID
            <input
              required
              value={sessionId}
              onChange={(event) => setSessionId(event.target.value)}
              className="mt-1.5 w-full rounded-md border border-line px-3 py-2"
              placeholder="Session UUID"
            />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Review type
            <select
              value={reviewType}
              onChange={(event) =>
                setReviewType(event.target.value as ReviewType)
              }
              className="mt-1.5 w-full rounded-md border border-line px-3 py-2"
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>
          <TextArea
            label="Coach context"
            value={coachContext}
            onChange={setCoachContext}
            placeholder="What should the coach focus on?"
          />
          <TextArea
            label="Session objectives"
            value={objectives}
            onChange={setObjectives}
            placeholder="One objective per line"
          />
          <TextArea
            label="Focus areas"
            value={focus}
            onChange={setFocus}
            placeholder="One focus area per line"
          />
          <TextArea
            label="Manual observations"
            value={observations}
            onChange={setObservations}
            placeholder="One observation per line"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              icon={BrainCircuit}
              isLoading={create.isPending}
            >
              Generate review
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block text-sm font-semibold text-ink">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 min-h-24 w-full rounded-md border border-line px-3 py-2 font-normal"
        placeholder={placeholder}
      />
    </label>
  );
}
