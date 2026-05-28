"use client";

import { IProduct } from "@/api/interfaces/products";
import { addItemsToCart } from "@/redux/slices/auth-slice";
import { useAppDispatch } from "@/redux/store";
import { useState } from "react";
import { GrAdd, GrSubtract } from "react-icons/gr";
import { useSelector } from "react-redux";

const AddToCart = ({ product }: { product: IProduct }) => {
  const dispatch = useAppDispatch();
  const auth = useSelector((state: any) => state.auth);
  const [amount, setAmount] = useState<number>(1);

  const handleAddToCart = () => {
    if (!auth.isLoggedIn) return;

    const existing = (auth.cart.products as any[]) ?? [];
    const total = auth.cart.total + product.Price * amount;
    const idx = existing.findIndex((p: any) => p.ID === product.ID);

    let products;
    if (idx > -1) {
      products = existing.map((p: any, i: number) =>
        i === idx ? { ...p, Quantity: p.Quantity + amount } : p
      );
    } else {
      products = [...existing, { ...product, Quantity: amount }];
    }

    dispatch(addItemsToCart({ products, total }));
  };

  return (
    <div className="flex flex-col h-full justify-self-end content-evenly w-1/3 rounded-lg shadow p-4 bg-bg-secondary">
      <div className="flex flex-row justify-between">
        <p className="text-3xl -mt-1 mb-8 font-bold text-left">Price: </p>
        <p className="text-2xl mb-8 text-left">
          {product.Price * amount} {product.Unit}
        </p>
      </div>
      <div className="flex h-1/2 flex-row content-center space-x-2">
        <p className="text-2xl font-bold -mt-1 text-left">Quantity: </p>
        <div className="flex flex-row w-full justify-center space-x-8">
          <div onClick={() => amount > 1 && setAmount(amount - 1)}>
            <GrSubtract className="text-2xl cursor-pointer" />
          </div>
          <p className="text-2xl -mt-1">{amount}</p>
          <div onClick={() => setAmount(amount + 1)}>
            <GrAdd className="text-2xl cursor-pointer" />
          </div>
        </div>
      </div>
      <div className="flex flex-row w-full">
        <button
          onClick={handleAddToCart}
          className="bg-primary w-full text-xl text-white p-2 rounded-md disabled:opacity-50"
          disabled={!auth.isLoggedIn}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default AddToCart;
