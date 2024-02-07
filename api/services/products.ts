import { AxiosResponse } from "axios";
import { IOrder, IProduct, ProductReq } from "../interfaces/products";
import backendAxiosInstance from "..";
import jwt from "jsonwebtoken"

export const _getProducts = async (id: string, cursor: string): Promise<AxiosResponse<IProduct[]>> => {

    try {
        const res = await backendAxiosInstance.get(`/api/products/store/${id}?cursor=${cursor}&limit=10`,
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Expose-Headers": "next-cursor",
          },
        });
        return res;
    } catch (error) {
        console.error(error);
        throw error;
    }

}

export const _getOrders = async (token: string): Promise<AxiosResponse<IOrder[]>> => {
    try {
        const decoded = jwt.decode(token, { complete: true });
    
        if (!decoded) {
            throw new Error("Invalid token");
        }

        // jwt.verify(token, CONFIG.PUBLIC_KEY, { algorithms: ["RS256"] }, (err) => {
        //   if (err) {
        //     throw new Error("Invalid token");
        //   }
        // });

        const res = await backendAxiosInstance.get("/api/products/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        return res
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const _createProduct = async (data: ProductReq, token: string) => {
  try {
    const decoded = jwt.decode(token, { complete : true });

    if (!decoded) {
      throw new Error("Invalid token");
    }

    const form = new FormData();
    form.append('name', data.Name)
    form.append('price', data.Price)
    form.append('description', data.Description)
    form.append('storeId', data.StoreID)
    form.append('image', data.Image!)

    const res = await backendAxiosInstance.postForm("/api/products", form, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return res
  } catch (error) { 
    console.error(error);
    throw error;
  }
}