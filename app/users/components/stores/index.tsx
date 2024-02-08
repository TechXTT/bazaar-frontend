import backendAxiosInstance, { productsService } from "@/api";
import { IProduct } from "@/api/interfaces/products";
import { IStore } from "@/api/interfaces/stores";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import useSWR from "swr";


type StoresPageProps = {
    id: string
}

type storeData = {
    data: IStore;
  };

const StoresPage = ({ id }: StoresPageProps) => {

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

            const resp = await productsService.getProducts(id, cursor)

            if (resp.data.length > 0 && resp.data !== nextProductsData) {
                setPrevProductsData([...prevProductsData, ...nextProductsData]);
                setNextProductsData(resp.data);
            }

            const date = new Date((resp.headers["next-cursor"].split(" ")[0] + " " + resp.headers["next-cursor"].split(" ")[1])).getTime();
            const nextCursor = new Date(date + 2 * 60 * 60 * 1000).toISOString()
            setCursor(nextCursor);
            
        } catch (error: any) {
            if (error.response.status.toString() === '404') {
                setEnableScroll(false);
            } else if (error.response.status.toString() === '500') {
                setEnableScroll(false);
            }
            console.log(error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [inView]);

    if (!storeData) return <div>Loading...</div>;
    
    return (
        <div className="flex overflow-y-scroll w-2/3">
            <div className="flex flex-col w-full shadow p-4 md:space-y-2 ">
            {[...prevProductsData, ...nextProductsData]
            ? [...prevProductsData, ...nextProductsData].map((product) => (
                <Link href={`/products/${product.ID}`} key={product.ID} className="flex w-full">
                    <div className="flex w-full">
                        <div className="flex w-full p-2 text-lg  hover:bg-[#416165] cursor-pointer rounded bg-[#50787d] text-white">
                            {product.Name}
                        </div>
                    </div>
                </Link>

                ))
            : null}
                
                {enableScroll && (<div ref={ref} className="flex justify-center">
          <div><p>Loading...</p></div>
          </div>)}
            </div>
        </div>
    )
}

export default StoresPage