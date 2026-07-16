import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { normalizeApiError } from "../../../api/api-client";
import { Button } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import { ErrorState, PageLoading } from "../../../components/feedback/States";
import { useToast } from "../../../components/feedback/Toast";
import { useCreateRevision, useReview } from "../hooks/useReviews";
import type {
  ActiveDraft,
  ImprovementArea,
  Observation,
  RecommendedDrill,
  RevisionPayload,
  Strength,
} from "../types";

const blankObservation = (): Observation => ({
  title: "",
  description: "",
  category: "technique",
  priority: "medium",
  confidence: null,
  evidence: null,
  coach_verified: false,
});
const blankStrength = (): Strength => ({ title: "", description: "" });
const blankImprovement = (): ImprovementArea => ({
  title: "",
  description: "",
  priority: "medium",
});
const blankDrill = (): RecommendedDrill => ({
  name: "",
  description: "",
  reason: "",
  difficulty: "beginner",
  frequency: null,
  safety_note: null,
});

export function ReviewEditPage() {
  const { reviewId = "" } = useParams();
  const review = useReview(reviewId);
  const save = useCreateRevision(reviewId);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [draft, setDraft] = useState<ActiveDraft | null>(null);
  const [changeSummary, setChangeSummary] = useState("");
  useEffect(() => {
    if (review.data?.active_draft)
      setDraft(structuredClone(review.data.active_draft));
  }, [review.data?.active_draft]);
  const dirty = useMemo(
    () =>
      Boolean(
        (draft &&
          JSON.stringify(draft) !==
            JSON.stringify(review.data?.active_draft)) ||
        changeSummary,
      ),
    [draft, review.data?.active_draft, changeSummary],
  );
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  if (review.isLoading || !draft)
    return <PageLoading label="Loading editable draft" />;
  if (review.isError || !review.data || !review.data.allowed_actions.can_edit)
    return <ErrorState message="This review is not available for editing." />;
  const update = (changes: Partial<ActiveDraft>) =>
    setDraft({ ...draft, ...changes });
  const submit = async () => {
    const payload: RevisionPayload = {
      expected_revision_number: review.data.latest_revision_number,
      summary: draft.summary,
      observations: draft.observations,
      strengths: draft.strengths,
      improvement_areas: draft.improvement_areas,
      recommended_drills: draft.recommended_drills,
      coach_notes: draft.coach_notes || null,
      athlete_message: draft.athlete_message || null,
      change_summary: changeSummary || null,
    };
    try {
      await save.mutateAsync(payload);
      showToast("Immutable coach revision saved");
      navigate(`/reviews/${reviewId}`);
    } catch (error) {
      const apiError = normalizeApiError(error);
      showToast(
        apiError.status === 409
          ? "A newer revision exists. Reload before saving."
          : apiError.message,
        "error",
      );
      if (apiError.status === 409) review.refetch();
    }
  };
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-ink">Edit coach review</h1>
        <p className="mt-1 text-sm text-gray-600">
          Saving creates revision {review.data.latest_revision_number + 1}.
          Existing revisions are never overwritten.
        </p>
      </header>
      <Card>
        <label className="block text-sm font-semibold">
          Summary
          <textarea
            value={draft.summary}
            onChange={(event) => update({ summary: event.target.value })}
            className="mt-1.5 min-h-32 w-full rounded-md border border-line px-3 py-2 font-normal"
          />
        </label>
      </Card>
      <ObservationEditor
        items={draft.observations}
        onChange={(observations) => update({ observations })}
      />
      <SimpleEditor
        title="Strengths"
        items={draft.strengths}
        create={blankStrength}
        onChange={(strengths) => update({ strengths })}
        fields={["title", "description"]}
      />
      <SimpleEditor
        title="Improvement areas"
        items={draft.improvement_areas}
        create={blankImprovement}
        onChange={(improvement_areas) => update({ improvement_areas })}
        fields={["title", "description", "priority"]}
      />
      <SimpleEditor
        title="Recommended drills"
        items={draft.recommended_drills}
        create={blankDrill}
        onChange={(recommended_drills) => update({ recommended_drills })}
        fields={["name", "description", "reason", "difficulty"]}
      />
      <Card>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-semibold">
            Private coach notes
            <textarea
              value={draft.coach_notes ?? ""}
              onChange={(event) => update({ coach_notes: event.target.value })}
              className="mt-1.5 min-h-28 w-full rounded-md border border-line px-3 py-2 font-normal"
            />
          </label>
          <label className="block text-sm font-semibold">
            Athlete-facing message
            <textarea
              value={draft.athlete_message ?? ""}
              onChange={(event) =>
                update({ athlete_message: event.target.value })
              }
              className="mt-1.5 min-h-28 w-full rounded-md border border-line px-3 py-2 font-normal"
            />
          </label>
        </div>
        <label className="mt-5 block text-sm font-semibold">
          Change summary
          <textarea
            value={changeSummary}
            onChange={(event) => setChangeSummary(event.target.value)}
            className="mt-1.5 min-h-20 w-full rounded-md border border-line px-3 py-2 font-normal"
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(`/reviews/${reviewId}`)}
          >
            Cancel
          </Button>
          <Button icon={Save} isLoading={save.isPending} onClick={submit}>
            Save revision
          </Button>
        </div>
      </Card>
    </div>
  );
}

function move<T>(items: T[], index: number, delta: number): T[] {
  const next = [...items];
  const target = index + delta;
  if (target < 0 || target >= next.length) return next;
  const current = next[index]!;
  next[index] = next[target]!;
  next[target] = current;
  return next;
}
function ObservationEditor({
  items,
  onChange,
}: {
  items: Observation[];
  onChange: (items: Observation[]) => void;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-ink">Observations</h2>
        <Button
          variant="secondary"
          icon={Plus}
          onClick={() => onChange([...items, blankObservation()])}
        >
          Add
        </Button>
      </div>
      <div className="mt-4 space-y-4">
        {items.map((item, index) => (
          <div key={index} className="border-t border-line pt-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Field
                label="Title"
                value={item.title}
                onChange={(value) =>
                  onChange(
                    items.map((valueItem, itemIndex) =>
                      itemIndex === index
                        ? { ...valueItem, title: value }
                        : valueItem,
                    ),
                  )
                }
              />
              <Field
                label="Description"
                value={item.description}
                onChange={(value) =>
                  onChange(
                    items.map((valueItem, itemIndex) =>
                      itemIndex === index
                        ? { ...valueItem, description: value }
                        : valueItem,
                    ),
                  )
                }
              />
              <SelectField
                label="Priority"
                value={item.priority}
                options={["low", "medium", "high"]}
                onChange={(value) =>
                  onChange(
                    items.map((valueItem, itemIndex) =>
                      itemIndex === index
                        ? {
                            ...valueItem,
                            priority: value as Observation["priority"],
                          }
                        : valueItem,
                    ),
                  )
                }
              />
              <Field
                label="Confidence"
                value={item.confidence?.toString() ?? ""}
                onChange={(value) =>
                  onChange(
                    items.map((valueItem, itemIndex) =>
                      itemIndex === index
                        ? {
                            ...valueItem,
                            confidence: value ? Number(value) : null,
                          }
                        : valueItem,
                    ),
                  )
                }
              />
            </div>
            <label className="mt-3 flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={item.coach_verified}
                onChange={(event) =>
                  onChange(
                    items.map((valueItem, itemIndex) =>
                      itemIndex === index
                        ? { ...valueItem, coach_verified: event.target.checked }
                        : valueItem,
                    ),
                  )
                }
              />
              Coach verified
            </label>
            <ReorderButtons index={index} items={items} onChange={onChange} />
          </div>
        ))}
      </div>
    </Card>
  );
}
function SimpleEditor<T extends object>({
  title,
  items,
  create,
  onChange,
  fields,
}: {
  title: string;
  items: T[];
  create: () => T;
  onChange: (items: T[]) => void;
  fields: Array<keyof T>;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-ink">{title}</h2>
        <Button
          variant="secondary"
          icon={Plus}
          onClick={() => onChange([...items, create()])}
        >
          Add
        </Button>
      </div>
      <div className="mt-4 space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="grid gap-3 border-t border-line pt-4 md:grid-cols-2"
          >
            {fields.map((field) => (
              <Field
                key={String(field)}
                label={String(field).replace(/_/g, " ")}
                value={String(item[field] ?? "")}
                onChange={(value) =>
                  onChange(
                    items.map((valueItem, itemIndex) =>
                      itemIndex === index
                        ? { ...valueItem, [field]: value as T[keyof T] }
                        : valueItem,
                    ),
                  )
                }
              />
            ))}
            <ReorderButtons index={index} items={items} onChange={onChange} />
          </div>
        ))}
      </div>
    </Card>
  );
}
function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-semibold capitalize">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-line px-3 py-2 font-normal"
      />
    </label>
  );
}
function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-line px-3 py-2 font-normal"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
function ReorderButtons<T>({
  index,
  items,
  onChange,
}: {
  index: number;
  items: T[];
  onChange: (items: T[]) => void;
}) {
  return (
    <div className="flex items-end gap-1">
      <Button
        variant="ghost"
        aria-label="Move up"
        icon={ArrowUp}
        onClick={() => onChange(move(items, index, -1))}
      />
      <Button
        variant="ghost"
        aria-label="Move down"
        icon={ArrowDown}
        onClick={() => onChange(move(items, index, 1))}
      />
      <Button
        variant="ghost"
        aria-label="Remove item"
        icon={Trash2}
        onClick={() =>
          onChange(items.filter((_, itemIndex) => itemIndex !== index))
        }
      />
    </div>
  );
}
