"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const LISTBOX_ID = "product-search-listbox";

/**
 * FE-14: keyboard-navigable search combobox.
 * - The input is an ARIA combobox controlling a listbox of results.
 * - ArrowDown/ArrowUp move a roving `activeIndex`; Enter opens the active hit;
 *   Escape closes the dropdown. Each option is focusable via aria-activedescendant.
 */
function SearchBox({ onClose }: { onClose: () => void }) {
  const { query, refine } = useSearchBox();
  const { hits } = useHits<ProductHit>();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleHits = hits.slice(0, 5);
  const isOpen = open && query.length > 0 && visibleHits.length > 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset the highlighted option whenever the result set changes.
  useEffect(() => setActiveIndex(-1), [query]);

  const select = (hit: ProductHit) => {
    router.push(`/products/${hit.objectID}`);
    setOpen(false);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % visibleHits.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? visibleHits.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      select(visibleHits[activeIndex]);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="search"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={LISTBOX_ID}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 ? `${LISTBOX_ID}-option-${activeIndex}` : undefined
        }
        value={query}
        onChange={(e) => {
          refine(e.currentTarget.value);
          setOpen(e.currentTarget.value.length > 0);
        }}
        onFocus={() => query.length > 0 && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search products…"
        className="w-full rounded-lg border border-vault-border bg-vault-surface px-4 py-2 text-sm outline-none focus:border-vault-border-accent placeholder:text-vault-text-secondary"
      />
      {isOpen && (
        <ul
          id={LISTBOX_ID}
          role="listbox"
          aria-label="Product search results"
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-vault-border bg-vault-surface shadow-vault-popover"
        >
          {visibleHits.map((hit, i) => (
            <li
              key={hit.objectID}
              id={`${LISTBOX_ID}-option-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => {
                // Prevent the input losing focus before navigation runs.
                e.preventDefault();
                select(hit);
              }}
              className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors ${
                i === activeIndex ? "bg-vault-surface-2" : "hover:bg-vault-surface-2"
              }`}
            >
              {hit.ImageURL && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={hit.ImageURL}
                  alt={hit.Name}
                  className="h-10 w-10 rounded object-cover shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{hit.Name}</p>
                <p className="truncate text-xs text-vault-text-secondary">{hit.StoreName}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold">
                ${hit.Price.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ProductSearch() {
  // Memoize the client so it isn't recreated on every render, which would
  // otherwise force react-instantsearch to remount and drop the current query.
  const searchClient = useMemo(
    () =>
      CONFIG.ALGOLIA_APP_ID
        ? algoliasearch(CONFIG.ALGOLIA_APP_ID, CONFIG.ALGOLIA_SEARCH_KEY)
        : null,
    []
  );

  if (!searchClient) return null;

  return (
    <InstantSearch searchClient={searchClient} indexName={CONFIG.ALGOLIA_INDEX}>
      <SearchBox onClose={() => {}} />
    </InstantSearch>
  );
}
