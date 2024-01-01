"use client";

import backendAxiosInstance from "@/api";
import { ABI } from "@/escrow_abi";
import { clearCart } from "@/redux/slices/auth-slice";
import { useSDK } from "@metamask/sdk-react";
import { AxiosResponse } from "axios";
import { BrowserProvider, ethers, parseEther } from "ethers";
import { useState } from "react";
import { connect, useDispatch } from "react-redux";
const bytes32 = require('bytes32');

const CartPage = (props: any) => {
  const dispatch = useDispatch();
  const [account, setAccount] = useState("");
  let orderIds: {id: string, owner_address: string}[] = [];
	const { sdk, connected, connecting, chainId } = useSDK();

  const handleCheckout = async () => {
    if (!connected) {
      try {
        const accounts = await sdk?.connect();
        if (accounts){
          //@ts-ignore
          setAccount(accounts?.[0]);
        }
        } catch(err) {
        console.warn(`failed to connect..`, err);
        }
    }
    const createdAt = new Date().toISOString();
    const response: AxiosResponse<string[]> = await backendAxiosInstance.post(
      `/api/products/orders`,
      {
        data: props.auth.cart.products.map((product: any) => ({
          CreatedAt: createdAt,
          ProductID: product.ID,
          Quantity: product.Quantity,
        })),
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${props.auth.jwt}`,
        },
      }
    );

    if (response.status === 201) {
      response.data.forEach((resp: any) => {

        const messageToBytes32 = (message: string): string => {
            const cleanedUuid = message.replace(/-/g, "");
            if (cleanedUuid.length !== 32) {
                throw new Error("Invalid UUID length");
            }
            console.log("cleanedUuid", cleanedUuid)
            const bytes32Uuid = bytes32({input: cleanedUuid});
            return bytes32Uuid;
        }
        
        console.log("orderId", messageToBytes32(resp.id));
        orderIds.push({id: messageToBytes32(resp.id), owner_address: resp.owner_address});
      });
      //@ts-ignore
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const escrow = new ethers.Contract('0x254De371451A1552637A81068e0573193521214D', ABI, signer);
      orderIds.forEach(async (orderId, index) => {
        try{const value = parseEther(props.auth.cart.products[index].Price * props.auth.cart.products[index].Quantity /10 ** 4 + "")
        const result = await escrow.createOrder(orderId.id, orderId.owner_address, 120, {value: value})
        console.log("result", result);
        dispatch(clearCart());
      }
        catch(err) {
          console.log("err", err);
        }
      })
    }
  };

  return (
    <div className="flex w-full md:justify-center px-2 mx-auto md:h-screen py-28 px-10">
      <div className="flex flex-col w-full rounded-lg shadow p-4 md:space-y-2 ">
        <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-2xl">
          Stores
        </h1>

        <div className="grid grid-auto-fit-lg ">
          {props.auth.cart.products
            ? props.auth.cart.products.map((product: any) => (
                <div
                  key={product.ID}
                  className="flex flex-col w-72 justify-center p-2 m-2 bg-[#627C7F] rounded-lg shadow-md"
                >
                  <h2 className="text-xl font-bold text-left">
                    {product.Name}
                  </h2>
                  <p className="text-lg text-right">
                    {product.Price} {product.Unit}
                  </p>
                  <p className="text-lg text-right">{product.Quantity}</p>
                </div>
              ))
            : null}
        </div>

        <div className="flex justify-end">
          <p className="text-lg text-right">Total: {props.auth.cart.total}</p>
        </div>

        <button
          className="bg-[#151f20] text-white font-bold py-2 rounded"
          onClick={handleCheckout}
          disabled={connected ? false : true}
        >
          Checkout
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

export default connect(mapStateToProps)(CartPage);
