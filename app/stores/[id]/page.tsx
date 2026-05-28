"use client";
import backendAxiosInstance, { productsService } from "@/api";
import { IStore } from "@/api/interfaces/stores";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { useInView } from "react-intersection-observer";
import ProductCard from "@/app/stores/components/product";
import ReputationCard from "@/app/stores/components/reputation";
import Card from "@/components/ui/card";
import { useEffect, useState } from "react";
import { IProduct } from "@/api/interfaces/products";

type storeData = {
  data: IStore;
};

const StorePage = () => {
  const { id } = useParams<{ id: string }>();
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
      const response = await productsService.getProducts(id, cursor);

      if (response.data.length > 0 && response.data !== nextProductsData) {
        setPrevProductsData([...prevProductsData, ...nextProductsData]);
        setNextProductsData(response.data);
      }

      const date = new Date(
        response.headers["next-cursor"].split(" ")[0] +
          " " +
          response.headers["next-cursor"].split(" ")[1]
      ).getTime();
      const nextCursor = new Date(date + 2 * 60 * 60 * 1000).toISOString();
      setCursor(nextCursor);
    } catch (error: any) {
      if (error.response.status.toString() === "404") {
        setEnableScroll(false);
      } else if (error.response.status.toString() === "500") {
        setEnableScroll(false);
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [inView]);

  if (!storeData) return <div>Loading...</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <h1 className="text-2xl font-bold leading-tight tracking-tight">
          {storeData?.data.Name}
        </h1>
        <Card className="w-full p-4 lg:w-72 shrink-0">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
            Seller reputation
          </h2>
          <ReputationCard rep={storeData?.data.Reputation ?? null} />
        </Card>
      </div>

      <div className="grid grid-auto-fit-lg">
        {[...prevProductsData, ...nextProductsData].map((product) => (
          <ProductCard key={product.ID} product={product} />
        ))}
      </div>
      {enableScroll && (
        <div ref={ref} className="flex justify-center py-4">
          <p className="text-sm text-text-secondary">Loading...</p>
        </div>
      )}
    </div>
  );
};

export default StorePage;
