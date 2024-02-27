"use client";
import backendAxiosInstance from "@/api";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { IProduct } from "@/api/interfaces/products";
import Link from "next/link";
import AddCart from "../components/addCart";
import { useEffect, useState } from "react";

type productData = {
  data: IProduct;
};

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: productData, error: productError } = useSWR<productData, Error>(
    `/api/products/${id}`,
    backendAxiosInstance.get
  );

  const [product, setProduct] = useState<any | null>();
  const [edit, setEdit] = useState<boolean>(false);

  useEffect(() => {
    setProduct(productData?.data);
  }, [productData]);

  if (!productData) return <div>Loading...</div>;

  if (!product) return <div>Loading...</div>;

  return (
    <div className="flex w-full pt-36 pb-2 md:justify-center px-16 mx-auto h-screen ">
      <div className="flex flex-row w-full rounded-lg shadow p-4 h-3/4 bg-[#324B4E]">
        <img
          src={
            "https://bucket-for-bazaar.fra1.cdn.digitaloceanspaces.com/" +
            product?.ImageURL
          }
          alt={product?.Name}
          className="w-1/3 h-full object-cover rounded-lg mr-8"
        />
        <div className={`flex flex-col ${edit ? "w-2/3" : "w-1/3"} mr-4`}>
          <Link
            href={`/stores/${product?.StoreID}`}
            className="text-base underline text-left mb-4"
          >
            Visit the {product?.Store.Name} Store
          </Link>
          {edit ? (
            <div>
              <p className="text-xl font-bold text-left">Product Name: </p>
              <textarea
                value={product?.Name}
                // @ts-ignore
                onChange={(e) =>
                  setProduct({ ...product, Name: e.target.value })
                }
                className="text-2xl text-balance font-bold mb-4 text-left border-2 rounded p-1 bg-transparent w-full "
              />
            </div>
          ) : (
            <h2 className="text-2xl text-balance font-bold mb-4 text-left">
              {product?.Name}
            </h2>
          )}

          {edit ? (
            <div>
              <p className="text-xl font-bold text-left ">Price: </p>
              <div className="flex flex-row">
                <input
                  value={product?.Price}
                  // @ts-ignore
                  onChange={(e) =>
                    setProduct({ ...product, Price: e.target.value })
                  }
                  className="text-xl text-right mb-4 mr-1 border-2 rounded px-1 bg-transparent w-20 "
                />
                <p className="text-2xl text-left mb-4">{product?.Unit}</p>
              </div>
            </div>
          ) : (
            <p className="text-xl text-left mb-4">
              {product?.Price} {product?.Unit}
            </p>
          )}
          <p className="text-xl font-bold text-left">
            Additional information:{" "}
          </p>
          {edit ? (
            <textarea
              value={product?.Description}
              // @ts-ignore
              onChange={(e) =>
                setProduct({ ...product, Description: e.target.value })
              }
              className="text-xl text-left border-2 rounded p-1 bg-transparent w-full mb-4"
            />
          ) : (
            <p className="text-lg text-left">{product?.Description}</p>
          )}

          {edit && (
            <AddCart
              product={product}
              productData={productData?.data}
              setProduct={setProduct}
              edit={edit}
              setEdit={setEdit}
            />
          )}
        </div>
        {!edit && (
          <AddCart
            product={product}
            productData={productData?.data}
            setProduct={setProduct}
            edit={edit}
            setEdit={setEdit}
          />
        )}
      </div>
    </div>
  );
};

export default ProductPage;
