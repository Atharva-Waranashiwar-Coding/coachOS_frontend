import { AlertTriangle, Inbox, LoaderCircle } from "lucide-react";
import { Button } from "../common/Button";

export function PageLoading({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="flex min-h-64 items-center justify-center gap-3 text-sm text-gray-600"
      role="status"
    >
      <LoaderCircle className="h-5 w-5 animate-spin text-brand-600" />
      {label}
    </div>
  );
}
export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="panel overflow-hidden" aria-label="Loading content">
      <div className="animate-pulse divide-y divide-line">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex gap-4 p-5">
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 rounded bg-gray-200" />
              <div className="h-3 w-2/3 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="panel flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
      <span className="mb-4 rounded-full bg-gray-100 p-3">
        <Inbox className="h-6 w-6 text-gray-500" />
      </span>
      <h2 className="font-semibold text-ink">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-gray-600">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="panel flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center"
      role="alert"
    >
      <span className="mb-4 rounded-full bg-red-50 p-3">
        <AlertTriangle className="h-6 w-6 text-red-600" />
      </span>
      <h2 className="font-semibold text-ink">We couldn&apos;t load this</h2>
      <p className="mt-1 max-w-md text-sm text-gray-600">{message}</p>
      {onRetry && (
        <Button className="mt-5" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
