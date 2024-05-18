"use client";

import backendAxiosInstance from "@/api";
import { IStore } from "@/api/interfaces/stores";
import Link from "next/link";
import { useEffect } from "react";
import useSWR from "swr";
import ProductCard from "./components/product";
import MiniProductCard from "./components/mini-product";

type storesData = {
  data: IStore[];
};

const StoresPage = () => {
  const { data: storesData, error: storesError } = useSWR<storesData, Error>(
    "/api/stores",
    backendAxiosInstance.get
  );

  useEffect(() => {
    console.log("storesData", storesData);
  }, [storesData]);

  if (!storesData) return <div>Loading...</div>;
  if (storesError) return <div>Failed to load</div>;

  return (
    <div className="flex w-full md:justify-center px-2 mx-auto md:h-screen py-28 px-10">
      <div className="flex flex-col w-full rounded-lg shadow p-4 md:space-y-2 ">
        <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-2xl">
          Stores
        </h1>

        <div className="grid grid-auto-fit-lg ">
          {storesData.data
            ? storesData.data.map((store) => (
                <Link
                  key={store.ID}
                  className="flex flex-col w-72 p-2 m-2 bg-[#627C7F] rounded-lg shadow-md"
                  href={`/stores/${store.ID}`}
                >
                  <h2 className="text-xl font-bold text-left">{store.Name}</h2>
                  <div className="flex flex-row justify-between overflow-x-auto">
                  {store.Products?.map((product) => (
                    <MiniProductCard key={product.ID} product={product} />
                  ))}
                  </div>
                </Link>
              ))
            : null}
        </div>
      </div>
    </div>
  );
};

export default StoresPage;
