import { AxiosResponse } from "axios";
import { IOrder, IProduct, OrderReq, ProductReq } from "../interfaces/products";
import backendAxiosInstance from "..";

export const ORDER_FILTERS = {
  all: "all",
  buyer: "buyer",
  seller: "seller",
} as const;

export const _getOrder = async (id: string): Promise<AxiosResponse<IOrder>> =>
  backendAxiosInstance.get(`/api/products/orders/${id}`);

export const _getProduct = async (id: string): Promise<AxiosResponse<IProduct>> =>
  backendAxiosInstance.get(`/api/products/${id}`);

export const _getAllProducts = async (): Promise<AxiosResponse<IProduct[]>> =>
  backendAxiosInstance.get("/api/products");

export const _getProducts = async (
  id: string,
  cursor: string
): Promise<AxiosResponse<IProduct[]>> =>
  backendAxiosInstance.get(`/api/products/store/${id}?cursor=${cursor}&limit=10`, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Expose-Headers": "next-cursor",
    },
  });

export const _getOrders = async (filter: string): Promise<AxiosResponse<IOrder[]>> =>
  backendAxiosInstance.get(`/api/orders?filter=${filter}`);

export const _createProduct = async (data: ProductReq): Promise<AxiosResponse<IProduct>> => {
  const form = new FormData();
  form.append("name", data.Name);
  form.append("price", data.Price);
  form.append("description", data.Description);
  form.append("storeId", data.StoreID);
  form.append("image", data.Image!);
  return backendAxiosInstance.postForm("/api/products", form);
};

export const _updateProduct = async (
  id: string,
  data: Partial<IProduct>
): Promise<AxiosResponse<IProduct>> =>
  backendAxiosInstance.put(`/api/products/${id}`, data);

export const _deleteProduct = async (id: string): Promise<AxiosResponse> =>
  backendAxiosInstance.delete(`/api/products/${id}`);

export const _createOrders = async (orders: OrderReq[]): Promise<AxiosResponse> =>
  backendAxiosInstance.post("/api/products/orders", { data: orders });
