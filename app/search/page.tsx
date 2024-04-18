"use client"
import { CONFIG } from "@/config/config";
import algoliasearch from 'algoliasearch/lite';
import { useEffect } from "react";
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch';
import ProductCard from "../stores/components/product";
// import HitsGrid from "./components/hits";
import './overwrite.css'

const searchClient = algoliasearch(CONFIG.ALGOLIA_APP_ID, CONFIG.ALGOLIA_API_KEY)

const parseHit = (hit: any) => {
    return {
        ID: hit.objectID,
        Name: hit.name,
        Description: hit.description,
        Price: hit.price,
        ImageURL: hit.image_url ? hit.image_url : hit.imageURL
    }
}

function Hit({ hit }: { hit: any}) {
    return (
      <ProductCard key={hit.ID} product={parseHit(hit)} />
    );
  }
  

const SearchPage = () => {
    return (
        <div className="flex w-full ">
        <InstantSearch indexName="products" searchClient={searchClient}>
        <SearchBox
        placeholder="Search for products"
        classNames={{
          root: 'p-3 shadow-sm',
          form: 'relative',
          input: 'block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md focus:ring-1',
          submitIcon: 'absolute top-0 left-0 bottom-0 w-6',
        }}
      />
                <Hits hitComponent={Hit} className="flex w-full" />
        </InstantSearch>
        </div>
    );
}

export default SearchPage;