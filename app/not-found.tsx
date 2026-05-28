import EmptyState from "@/components/ui/empty-state";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-32 sm:px-6 lg:px-8">
      <EmptyState
        title="Not found"
        description="The page you requested does not exist in this marketplace."
        action={<Link href="/stores" className="underline">Browse stores</Link>}
      />
    </div>
  );
}
