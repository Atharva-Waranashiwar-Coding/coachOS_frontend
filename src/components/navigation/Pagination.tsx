import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../common/Button";
export function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1)
    return total ? (
      <p className="text-sm text-gray-500">
        {total} result{total === 1 ? "" : "s"}
      </p>
    ) : null;
  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4"
    >
      <p className="text-sm text-gray-500">
        Page {page} of {totalPages} · {total} results
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          icon={ChevronLeft}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
