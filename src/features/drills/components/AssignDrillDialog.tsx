import { BookOpen, Bot, Plus, Send } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { normalizeApiError } from "../../../api/api-client";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { Dialog } from "../../../components/feedback/Dialog";
import { useToast } from "../../../components/feedback/Toast";
import { Input, Select, Textarea } from "../../../components/forms/Fields";
import { formatEnum } from "../../../lib/formatters";
import { useApprovedSnapshot } from "../../ai-review/hooks/useReviews";
import { useCreateAssignment, useDrills } from "../hooks/useDrills";
import type { AssignmentCreatePayload } from "../types";

type Mode = "library" | "review" | "custom";
interface OptionsState {
  priority: string;
  startDate: string;
  dueDate: string;
  sets: string;
  repetitions: string;
  duration: string;
  frequency: string;
  instructions: string;
  notes: string;
}
const initialOptions: OptionsState = {
  priority: "3",
  startDate: "",
  dueDate: "",
  sets: "",
  repetitions: "",
  duration: "",
  frequency: "",
  instructions: "",
  notes: "",
};

export function AssignDrillDialog({
  athleteId,
  open,
  onClose,
  initialReviewId = "",
  initialRecommendationIndex,
}: {
  athleteId: string;
  open: boolean;
  onClose: () => void;
  initialReviewId?: string;
  initialRecommendationIndex?: number;
}) {
  const [mode, setMode] = useState<Mode>(
    initialReviewId ? "review" : "library",
  );
  const [drillId, setDrillId] = useState("");
  const [reviewId, setReviewId] = useState(initialReviewId);
  const [recommendationIndex, setRecommendationIndex] = useState(
    initialRecommendationIndex ?? 0,
  );
  const [mappedDrillId, setMappedDrillId] = useState("");
  const [saveToLibrary, setSaveToLibrary] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [options, setOptions] = useState(initialOptions);
  const drills = useDrills({
    page: 1,
    page_size: 100,
    status: "active",
    sort_by: "title",
    sort_order: "asc",
  });
  const approved = useApprovedSnapshot(reviewId);
  const create = useCreateAssignment(athleteId);
  const { showToast } = useToast();
  useEffect(() => {
    if (initialReviewId) {
      setMode("review");
      setReviewId(initialReviewId);
      setRecommendationIndex(initialRecommendationIndex ?? 0);
    }
  }, [initialReviewId, initialRecommendationIndex]);
  const optionPayload = {
    priority: Number(options.priority),
    start_date: options.startDate || null,
    due_date: options.dueDate || null,
    target_sets: numberOrNull(options.sets),
    target_repetitions: numberOrNull(options.repetitions),
    target_duration_minutes: numberOrNull(options.duration),
    frequency: options.frequency || null,
    coach_notes: options.notes || null,
    instructions_override: options.instructions || null,
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    let payload: AssignmentCreatePayload;
    if (mode === "library") {
      if (!drillId) return showToast("Select a library drill", "error");
      payload = { mode, drill_id: drillId, ...optionPayload };
    } else if (mode === "review") {
      if (!reviewId || !approved.data?.recommended_drills[recommendationIndex])
        return showToast("Select an approved recommendation", "error");
      payload = {
        mode,
        source_review_id: reviewId,
        source_recommendation_index: recommendationIndex,
        mapped_drill_id: mappedDrillId || null,
        save_to_library: mappedDrillId ? false : saveToLibrary,
        ...optionPayload,
      };
    } else {
      if (!customTitle.trim() || !customInstructions.trim())
        return showToast("Title and instructions are required", "error");
      payload = {
        mode,
        title: customTitle,
        description: customDescription || null,
        instructions: customInstructions,
        ...optionPayload,
      };
    }
    try {
      await create.mutateAsync(payload);
      showToast("Drill assigned");
      onClose();
    } catch (error) {
      showToast(normalizeApiError(error).message, "error");
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Assign drill"
      description="Every assignment requires an explicit coach action."
    >
      <form className="space-y-5" onSubmit={submit}>
        <div
          className="grid grid-cols-3 rounded-md border border-line p-1"
          role="tablist"
          aria-label="Assignment source"
        >
          <ModeButton
            active={mode === "library"}
            icon={BookOpen}
            label="Library"
            onClick={() => setMode("library")}
          />
          <ModeButton
            active={mode === "review"}
            icon={Bot}
            label="AI review"
            onClick={() => setMode("review")}
          />
          <ModeButton
            active={mode === "custom"}
            icon={Plus}
            label="Custom"
            onClick={() => setMode("custom")}
          />
        </div>
        {mode === "library" && (
          <label className="block">
            <span className="label">Library drill</span>
            <Select
              required
              value={drillId}
              onChange={(event) => setDrillId(event.target.value)}
            >
              <option value="">Select a drill</option>
              {drills.data?.items.map((drill) => (
                <option key={drill.id} value={drill.id}>
                  {drill.title} · {formatEnum(drill.category)}
                </option>
              ))}
            </Select>
          </label>
        )}
        {mode === "review" && (
          <div className="space-y-4">
            <label className="block">
              <span className="label">Approved review ID</span>
              <Input
                required
                value={reviewId}
                onChange={(event) => setReviewId(event.target.value)}
                placeholder="Review UUID"
              />
            </label>
            {approved.isError && reviewId && (
              <p className="text-sm text-red-600">
                {normalizeApiError(approved.error).message}
              </p>
            )}
            {approved.data?.recommended_drills.map((recommendation, index) => (
              <label
                key={`${recommendation.name}-${index}`}
                className={`block cursor-pointer rounded-md border p-4 ${recommendationIndex === index ? "border-brand-500 bg-brand-50" : "border-line"}`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="recommendation"
                    className="mt-1"
                    checked={recommendationIndex === index}
                    onChange={() => setRecommendationIndex(index)}
                  />
                  <span>
                    <span className="flex flex-wrap items-center gap-2 font-semibold">
                      {recommendation.name}
                      <Badge>{formatEnum(recommendation.difficulty)}</Badge>
                    </span>
                    <span className="mt-1 block text-sm text-gray-600">
                      {recommendation.description}
                    </span>
                    <span className="mt-2 block text-xs text-gray-500">
                      {recommendation.reason}
                    </span>
                    {recommendation.safety_note && (
                      <span className="mt-2 block text-xs font-medium text-amber-800">
                        Safety: {recommendation.safety_note}
                      </span>
                    )}
                  </span>
                </div>
              </label>
            ))}
            {approved.data && (
              <>
                <label className="block">
                  <span className="label">Map to existing drill</span>
                  <Select
                    value={mappedDrillId}
                    onChange={(event) => {
                      setMappedDrillId(event.target.value);
                      if (event.target.value) setSaveToLibrary(false);
                    }}
                  >
                    <option value="">No existing library drill</option>
                    {drills.data?.items.map((drill) => (
                      <option key={drill.id} value={drill.id}>
                        {drill.title}
                      </option>
                    ))}
                  </Select>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={saveToLibrary}
                    disabled={Boolean(mappedDrillId)}
                    onChange={(event) => setSaveToLibrary(event.target.checked)}
                  />
                  Save this recommendation as a new private library drill
                </label>
              </>
            )}
          </div>
        )}
        {mode === "custom" && (
          <div className="space-y-4">
            <label className="block">
              <span className="label">Title</span>
              <Input
                required
                value={customTitle}
                onChange={(event) => setCustomTitle(event.target.value)}
              />
            </label>
            <label className="block">
              <span className="label">Description</span>
              <Textarea
                value={customDescription}
                onChange={(event) => setCustomDescription(event.target.value)}
              />
            </label>
            <label className="block">
              <span className="label">Instructions</span>
              <Textarea
                required
                value={customInstructions}
                onChange={(event) => setCustomInstructions(event.target.value)}
              />
            </label>
          </div>
        )}
        <AssignmentOptionsFields value={options} onChange={setOptions} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" icon={Send} isLoading={create.isPending}>
            Assign drill
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function ModeButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof BookOpen;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`flex min-h-10 items-center justify-center gap-2 rounded px-2 text-xs font-semibold sm:text-sm ${active ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function AssignmentOptionsFields({
  value,
  onChange,
}: {
  value: OptionsState;
  onChange: (value: OptionsState) => void;
}) {
  const set = (key: keyof OptionsState, next: string) =>
    onChange({ ...value, [key]: next });
  return (
    <fieldset className="space-y-4 border-t border-line pt-5">
      <legend className="text-sm font-bold">Assignment details</legend>
      <div className="grid gap-4 sm:grid-cols-3">
        <label>
          <span className="label">Priority</span>
          <Select
            value={value.priority}
            onChange={(event) => set("priority", event.target.value)}
          >
            {[1, 2, 3, 4, 5].map((number) => (
              <option key={number} value={number}>
                {number}
              </option>
            ))}
          </Select>
        </label>
        <label>
          <span className="label">Start date</span>
          <Input
            type="date"
            value={value.startDate}
            onChange={(event) => set("startDate", event.target.value)}
          />
        </label>
        <label>
          <span className="label">Due date</span>
          <Input
            type="date"
            min={value.startDate || undefined}
            value={value.dueDate}
            onChange={(event) => set("dueDate", event.target.value)}
          />
        </label>
        <label>
          <span className="label">Sets</span>
          <Input
            type="number"
            min="1"
            value={value.sets}
            onChange={(event) => set("sets", event.target.value)}
          />
        </label>
        <label>
          <span className="label">Repetitions</span>
          <Input
            type="number"
            min="1"
            value={value.repetitions}
            onChange={(event) => set("repetitions", event.target.value)}
          />
        </label>
        <label>
          <span className="label">Duration</span>
          <Input
            type="number"
            min="1"
            placeholder="Minutes"
            value={value.duration}
            onChange={(event) => set("duration", event.target.value)}
          />
        </label>
      </div>
      <label className="block">
        <span className="label">Frequency</span>
        <Input
          value={value.frequency}
          onChange={(event) => set("frequency", event.target.value)}
        />
      </label>
      <label className="block">
        <span className="label">Assignment instruction override</span>
        <Textarea
          value={value.instructions}
          onChange={(event) => set("instructions", event.target.value)}
        />
      </label>
      <label className="block">
        <span className="label">Private coach notes</span>
        <Textarea
          value={value.notes}
          onChange={(event) => set("notes", event.target.value)}
        />
      </label>
    </fieldset>
  );
}

function numberOrNull(value: string): number | null {
  return value ? Number(value) : null;
}
