import { AxiosResponse } from "axios";
import { IOrder, IProduct, OrderReq, ProductReq } from "../interfaces/products";
import backendAxiosInstance from "..";
import jwt from "jsonwebtoken";

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

export const _getOrders = async (
  token: string,
  filter: string
): Promise<AxiosResponse<IOrder[]>> => {
  try {
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded) {
      throw new Error("Invalid token");
    }

    const res = await backendAxiosInstance.get(
      `/api/products/orders?filter=${filter}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const _createProduct = async (data: ProductReq, token: string) => {
  try {
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded) {
      throw new Error("Invalid token");
    }

    const form = new FormData();
    form.append("name", data.Name);
    form.append("price", data.Price);
    form.append("description", data.Description);
    form.append("storeId", data.StoreID);
    form.append("image", data.Image!);

    const res = await backendAxiosInstance.postForm("/api/products", form, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const _updateProduct = async (data: IProduct, token: string) => {
  try {
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded) {
      throw new Error("Invalid token");
    }

    const res = await backendAxiosInstance.put(
      `/api/products/${data.ID}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const _deleteProduct = async (productId: string, token: string) => {
  try {
    return await backendAxiosInstance.delete(`/api/products/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const _createOrders = async (data: OrderReq[], token: string) => {
  try {
    return await backendAxiosInstance.post(
      `/api/products/orders`,
      {
        data: data,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};
