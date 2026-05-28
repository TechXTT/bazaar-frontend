"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { InstantSearch, useSearchBox, useHits } from "react-instantsearch";
import { algoliasearch } from "algoliasearch";
import { CONFIG } from "@/config/config";

interface ProductHit {
  objectID: string;
  Name: string;
  Price: number;
  StoreName: string;
  ImageURL?: string;
}

function SearchResults({ onSelect }: { onSelect: () => void }) {
  const { hits } = useHits<ProductHit>();
  const router = useRouter();

  if (hits.length === 0) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border-subtle bg-bg-color shadow-lg">
      {hits.slice(0, 5).map((hit) => (
        <button
          key={hit.objectID}
          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-bg-secondary transition-colors"
          onClick={() => {
            router.push(`/products/${hit.objectID}`);
            onSelect();
          }}
        >
          {hit.ImageURL && (
            <img
              src={hit.ImageURL}
              alt={hit.Name}
              className="h-10 w-10 rounded object-cover shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{hit.Name}</p>
            <p className="truncate text-xs text-text-secondary">{hit.StoreName}</p>
          </div>
          <span className="shrink-0 text-sm font-semibold">${hit.Price.toFixed(2)}</span>
        </button>
      ))}
    </div>
  );
}

function SearchBox({ onClose }: { onClose: () => void }) {
  const { query, refine } = useSearchBox();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="search"
        value={query}
        onChange={(e) => {
          refine(e.currentTarget.value);
          setOpen(e.currentTarget.value.length > 0);
        }}
        onFocus={() => query.length > 0 && setOpen(true)}
        placeholder="Search products…"
        className="w-full rounded-lg border border-border-subtle bg-bg-secondary px-4 py-2 text-sm outline-none focus:border-primary placeholder:text-text-secondary"
      />
      {open && query.length > 0 && (
        <SearchResults onSelect={() => { setOpen(false); onClose(); }} />
      )}
    </div>
  );
}

export default function ProductSearch() {
  if (!CONFIG.ALGOLIA_APP_ID) return null;

  const searchClient = algoliasearch(CONFIG.ALGOLIA_APP_ID, CONFIG.ALGOLIA_SEARCH_KEY);

  return (
    <InstantSearch searchClient={searchClient} indexName={CONFIG.ALGOLIA_INDEX}>
      <SearchBox onClose={() => {}} />
    </InstantSearch>
  );
}
