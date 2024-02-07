import { IOrder } from "@/api/interfaces/products";
import Link from "next/link";

type OrderComponentProps = {
    order: IOrder
}

const OrderComponent = ({ order} : OrderComponentProps) => {

    return (
        <Link href={`/order/${order.ID}`} className="flex w-full h-16 bg-[#416165] p-2 px-4 mb-2 rounded-md">
            <div className="flex w-full flex-row items-center">
                <div className="flex ">
                    <p>{order.Quantity} x {order.Product.Name}</p>
                </div>
                <div className="flex ml-auto">
                    <p>Price : {order.Total} {order.Product.Unit}</p>
                </div>
            </div>
        </Link>
    )
}

export default OrderComponent