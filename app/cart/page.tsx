"use client";
import Checkout from "../components/checkout";

const CartPage = () => (
    <div className="flex w-full md:justify-center px-2 mx-auto md:h-screen py-28 px-10">
      <div className="flex flex-col w-full rounded-lg shadow p-4 md:space-y-2 ">
        <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-2xl">
          Stores
        </h1>

        <Checkout />
      </div>
    </div>
  );
  
export default CartPage;
