"use client";
import backendAxiosInstance, { disputesService } from "@/api";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { IOrder } from "@/api/interfaces/products";
import { useEffect, useState } from "react";
import OpenDispute from "../components/openDispute";
import { IDispute } from "@/api/interfaces/disputes";

type orderData = {
  data: IOrder;
};

type disputeData = {
  data: IDispute;
};

const OrderPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: orderData, error: orderError } = useSWR<orderData, Error>(
    `/api/products/orders/${id}`,
    backendAxiosInstance.get
  );

  const [dispute, setDispute] = useState<IDispute>();

  const [order, setOrder] = useState<IOrder>();

  useEffect(() => {
    setOrder(orderData?.data);
  }, [orderData]);

  if (!orderData) return <div>Loading...</div>;

  if (!order) return <div>Loading...</div>;

  return (
    <div className="flex w-full pt-36 pb-2 md:justify-center px-16 mx-auto h-screen ">
      <div className="flex flex-row w-full h-4/5 rounded-lg shadow p-4 h-3/4 bg-[#324B4E]">
        <div className="flex self-center mr-4">
        <h2 className="text-3xl text-center">
          {order.Quantity} x
        </h2>
        </div>
        <div className="flex flex-col w-1/3">
        <img
          src={
            "https://bucket-for-bazaar.fra1.cdn.digitaloceanspaces.com/" +
            order.Product?.ImageURL
          }
          alt={order.Product?.Name}
          className="w-full h-full object-cover rounded-lg mr-8"
        />
        <h2 className="text-2xl text-justify font-bold mb-4 text-left">
          {order.Product?.Name}
        </h2>
        </div>
        <div className={`flex flex-col mr-4 w-3/5 h-full`}>
          <OpenDispute order={order} setDispute={setDispute} dispute={dispute} />
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
