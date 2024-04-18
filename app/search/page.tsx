"use client";
import { CONFIG } from "@/config/config";
import algoliasearch from "algoliasearch/lite";
import { InstantSearch, SearchBox, Hits } from "react-instantsearch";
import ProductCard from "../stores/components/product";
import "./overwrite.css";

const searchClient = algoliasearch(
  CONFIG.ALGOLIA_APP_ID,
  CONFIG.ALGOLIA_API_KEY
);

const parseHit = (hit: any) => {
  return {
    ID: hit.objectID,
    Name: hit.name,
    Description: hit.description,
    Price: hit.price,
    ImageURL: hit.image_url ? hit.image_url : hit.imageURL,
  };
};

function Hit({ hit }: { hit: any }) {
  return <ProductCard key={hit.ID} product={parseHit(hit)} />;
}

const SearchPage = () => {
  return (
    <div className="flex flex-col w-full h-screen pt-24">
      <InstantSearch indexName="products" searchClient={searchClient}>
        <div className="flex-shrink-0 shadow-sm z-10 w-full ">
          <SearchBox
            placeholder="Search for products"
            classNames={{
              root: "flex w-full justify-center",
              form: "flex w-full justify-center",
              input:
                " w-1/2 text-base rounded-lg block bg-transparent border-2 py-2.5 px-2",
              submit: "hidden",
            }}
          />
        </div>
        <div className="flex-grow overflow-auto">
          <div className="flex w-full justify-center">
            <Hits hitComponent={Hit} className="flex w-full" />
          </div>
        </div>
      </InstantSearch>
    </div>
  );
};

export default SearchPage;