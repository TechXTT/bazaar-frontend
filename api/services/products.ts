import { AxiosResponse } from "axios";
import { IOrder, IProduct, OrderReq, ProductReq } from "../interfaces/products";
import backendAxiosInstance from "..";

export const ORDER_FILTERS = {
  all: "all",
  buyer: "buyer",
  seller: "seller",
} as const;

export const _getAllProducts = async (): Promise<AxiosResponse<IProduct[]>> => {
  try {
    const res = await backendAxiosInstance.get("/api/products");
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const _getProducts = async (
  id: string,
  cursor: string
): Promise<AxiosResponse<IProduct[]>> => {
  try {
    const res = await backendAxiosInstance.get(
      `/api/products/store/${id}?cursor=${cursor}&limit=10`,
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Expose-Headers": "next-cursor",
        },
      }
    );
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Accepts optional leading token for backward compatibility (ignored — interceptor handles auth)
export const _getOrders = async (
  tokenOrFilter: string,
  filter?: string
): Promise<AxiosResponse<IOrder[]>> => {
  try {
    // If called as (token, filter), use filter; if called as (filter), use tokenOrFilter
    const actualFilter = filter !== undefined ? filter : tokenOrFilter;
    const res = await backendAxiosInstance.get(`/api/orders?filter=${actualFilter}`);
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const _createProduct = async (
  data: ProductReq,
  _token?: string | null
): Promise<AxiosResponse<IProduct>> => {
  try {
    const form = new FormData();
    form.append("name", data.Name);
    form.append("price", data.Price);
    form.append("description", data.Description);
    form.append("storeId", data.StoreID);
    form.append("image", data.Image!);

    const res = await backendAxiosInstance.postForm("/api/products", form);
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const _updateProduct = async (
  idOrData: string | IProduct,
  dataOrToken?: ProductReq | string | null,
  _token?: string | null
): Promise<AxiosResponse<IProduct>> => {
  try {
    let id: string;
    let data: ProductReq | IProduct;

    if (typeof idOrData === "string") {
      // New signature: (id, data)
      id = idOrData;
      data = dataOrToken as ProductReq;
    } else {
      // Old signature: (IProduct, token)
      id = idOrData.ID;
      data = idOrData;
    }

    const res = await backendAxiosInstance.put(`/api/products/${id}`, data);
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const _deleteProduct = async (
  id: string,
  _token?: string | null
): Promise<AxiosResponse> => {
  try {
    return await backendAxiosInstance.delete(`/api/products/${id}`);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const _createOrders = async (
  orders: OrderReq[],
  _token?: string | null
): Promise<AxiosResponse> => {
  try {
    return await backendAxiosInstance.post("/api/products/orders", {
      data: orders,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
