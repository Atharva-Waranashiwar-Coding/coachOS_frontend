import { CheckCircle2 } from "lucide-react";
import { Card } from "../../../components/common/Card";
import type { ReviewContent } from "../types";

export function ReviewSections({
  content,
  limitations,
}: {
  content: ReviewContent;
  limitations?: string[];
}) {
  return (
    <div className="space-y-5">
      <Card>
        <h2 className="text-lg font-bold text-ink">Summary</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
          {content.summary}
        </p>
      </Card>
      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="font-bold text-ink">Strengths</h2>
          <ul className="mt-3 space-y-3">
            {content.strengths.map((item) => (
              <li key={item.title}>
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-bold text-ink">Improvement areas</h2>
          <ul className="mt-3 space-y-3">
            {content.improvement_areas.map((item) => (
              <li key={item.title}>
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
              </li>
            ))}
          </ul>
        </Card>
      </section>
      <Card>
        <h2 className="font-bold text-ink">Observations</h2>
        <ul className="mt-3 space-y-3">
          {content.observations.map((item) => (
            <li key={`${item.title}-${item.description}`}>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">{item.title}</p>
                {item.coach_verified && (
                  <CheckCircle2
                    className="h-4 w-4 text-green-600"
                    aria-label="Coach verified"
                  />
                )}
              </div>
              <p className="text-sm text-gray-600">{item.description}</p>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <h2 className="font-bold text-ink">Recommended drills</h2>
        <div className="mt-3 space-y-4">
          {content.recommended_drills.map((item) => (
            <div key={item.name}>
              <p className="font-semibold text-sm">{item.name}</p>
              <p className="text-sm text-gray-600">{item.description}</p>
              <p className="mt-1 text-xs text-gray-500">{item.reason}</p>
            </div>
          ))}
        </div>
      </Card>
      {limitations && (
        <Card>
          <h2 className="font-bold text-ink">Evidence limitations</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600">
            {limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
