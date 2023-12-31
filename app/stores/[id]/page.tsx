"use client";
import backendAxiosInstance from "@/api";
import { AxiosError, AxiosResponse } from "axios";
import { IStore } from "@/api/interfaces/stores";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { useInView } from 'react-intersection-observer';  
import Image from "next/image";
import ProductCard from "@/app/components/product";
import { useEffect, useState } from "react";
import { IProduct } from "@/api/interfaces/products";

type storeData = {
  data: IStore;
};

const StorePage = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cursor, setCursor] = useState<string>("");
  const [prevProductsData, setPrevProductsData] = useState<IProduct[]>([]);
  const [nextProductsData, setNextProductsData] = useState<IProduct[]>([]);
  const [enableScroll, setEnableScroll] = useState<boolean>(true);
  const [ref, inView] = useInView();
  const { data: storeData, error: storeError } = useSWR<storeData, Error>(
    `/api/stores/${id}`,
    backendAxiosInstance.get
  );

  const fetchProducts = async () => {
    try {
      console.log('path', `/api/products/store/${id}?cursor=${cursor}&limit=10`)
    const response: AxiosResponse<IProduct[]> = await backendAxiosInstance.get(
      `/api/products/store/${id}?cursor=${cursor}&limit=10`,
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Expose-Headers": "next-cursor",
        },
      }
    );

    if (response.data.length > 0 && response.data !== nextProductsData) {
      setPrevProductsData([...prevProductsData, ...nextProductsData]);
      setNextProductsData(response.data);
    }
    setIsLoading(false);
    console.log('headers', response.headers["next-cursor"].split(" ")[0] + " " + response.headers["next-cursor"].split(" ")[1])
    const date = new Date((response.headers["next-cursor"].split(" ")[0] + " " + response.headers["next-cursor"].split(" ")[1])).getTime();
    const nextCursor = new Date(date + 2 * 60 * 60 * 1000).toISOString()
    setCursor(nextCursor);
    console.log('nextCursor', nextCursor);
  } catch (error: any) {
    if (error.response.status.toString() === '404') {
      setEnableScroll(false);
    }
    console.log(error);
  }
  };

  useEffect(() => {
    fetchProducts();
  }, [inView]);

  const handleScroll = () => {

    console.log('cursor', cursor);
    if (
      window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isLoading
    )
      return;


    fetchProducts();
    }

  if (!storeData) return <div>Loading...</div>;

  return (
    <div className="flex w-full md:justify-center px-2 mx-auto md:h-screen py-28 px-10">
      <div className="flex flex-col w-full rounded-lg shadow p-4 md:space-y-2 ">
        <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-2xl">
          {storeData?.data.Name}
        </h1>

        <div className="grid grid-auto-fit-lg ">
          {[...prevProductsData, ...nextProductsData]
            ? [...prevProductsData, ...nextProductsData].map((product) => <ProductCard key={product.ID} product={product} />)
            : null}
        </div>
        {enableScroll && (<div ref={ref} className="flex justify-center">
          <div><p>Loading...</p></div>
          </div>)}
        
      </div>
    </div>
  );
};

export default StorePage;
