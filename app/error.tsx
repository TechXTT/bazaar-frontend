"use client";

import Button from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <div className="mx-auto max-w-4xl px-4 py-32 sm:px-6 lg:px-8">
      <EmptyState
        title="Something went wrong"
        description="The page failed to render. Retry the request or move back to the marketplace."
        action={
          <Button onClick={reset} type="button">
            Try again
          </Button>
        }
      />
    </div>
  );
}
