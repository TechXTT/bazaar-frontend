import backendAxiosInstance, { productsService, storesService } from "@/api";
import { IProduct } from "@/api/interfaces/products";
import { IStore } from "@/api/interfaces/stores";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { connect } from "react-redux";
import useSWR from "swr";

type storeData = {
  data: IStore;
};

const StoresPage = (props: any) => {
  const id = props.id;
  const [cursor, setCursor] = useState<string>("");
  const [prevProductsData, setPrevProductsData] = useState<IProduct[]>([]);
  const [nextProductsData, setNextProductsData] = useState<IProduct[]>([]);
  const [enableScroll, setEnableScroll] = useState<boolean>(true);
  const [ref, inView] = useInView();
  const { data: storeData, error: storeError } = useSWR<storeData, Error>(
    `/api/stores/${id}`,
    backendAxiosInstance.get
  );

  const handleDeleteStore = async () => {
    const res = await storesService.deleteStore(id, props.auth.jwt);

    if (res.status === 200) {
      window.location.href = `/users/${props.auth.user.ID}?selected=Stores`;
    }
  };

  const fetchProducts = async () => {
    try {
      const resp = await productsService.getProducts(id, cursor);

      if (resp.data.length > 0 && resp.data !== nextProductsData) {
        setPrevProductsData([...prevProductsData, ...nextProductsData]);
        setNextProductsData(resp.data);
      } else if (resp.data.length === 0) {
        setEnableScroll(false);
      }

      const date = new Date(
        resp.headers["next-cursor"].split(" ")[0] +
          " " +
          resp.headers["next-cursor"].split(" ")[1]
      ).getTime();
      const nextCursor = new Date(date + 2 * 60 * 60 * 1000).toISOString();
      setCursor(nextCursor);
    } catch (error: any) {
      setEnableScroll(false);
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [inView]);

  if (!storeData) return <div>Loading...</div>;

  return (
    <div className="relative flex w-2/3 ttb">
      <div className="flex flex-col overflow-y-scroll w-full shadow p-4 md:space-y-2 ">
        <div className="flex flex-col w-full scroll-pb-24">
        {[...prevProductsData, ...nextProductsData]
          ? [...prevProductsData, ...nextProductsData].map((product, index) => (
              <Link
                href={`/products/${product.ID}`}
                key={product.ID}
                className={`flex w-full mb-2`}
              >
                  <div className="flex w-full text-lg p-2 hover:bg-[#416165] cursor-pointer rounded bg-[#50787d] text-white">
                    {product.Name}
                  </div>
              </Link>
            ))
          : null}
          </div>

        {enableScroll && (
          <div ref={ref} className="flex justify-center">
            <div>
              <p>Loading...</p>
            </div>
          </div>
        )}
      </div>
      <div className="flex w-full justify-center absolute left-0 right-0 bottom-2">
        <button
          className="text-2xl w-1/3 justify-self-end text-balance font-bold mt-4 bg-[#D0342C] rounded-lg px-4 py-2"
          onClick={handleDeleteStore}
        >
          Delete Store
        </button>
      </div>
    </div>
  );
};

const mapStateToProps = (state: any) => {
  return {
    auth: state.auth,
  };
};

export default connect(mapStateToProps)(StoresPage);
