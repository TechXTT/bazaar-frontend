import { productsService } from "@/api"
import { IOrder } from "@/api/interfaces/products"
import { useEffect, useState } from "react"
import { connect } from "react-redux"
import OrderComponent from "./components/order"

type Orders = {
    receiving: IOrder[],
    sending: IOrder[]
}

const OrdersPage = (props: any) => {

    const [orders, setOrders] = useState<Orders>({receiving: [], sending: []})

    const [filter, setFilter] = useState('receiving')

    useEffect(() => {
        const fetch = async () => {
            const res = await productsService.getOrders(props.auth.jwt, filter)
            console.log('res', res)
            if (res.status === 200) {
                setOrders({...orders, [filter]: res.data})
            }
        }   
        
        fetch()
    }, [filter])

    return (
        <div className="flex w-5/6 p-4 flex-col ">
            <div className="flex w-full flex-col items-center">
                <div className="flex w-full mb-4">
                    <h2 onClick={() => {
                        if (filter === 'sending') {
                            setFilter('receiving')
                        }
                    }} className={`text-2xl cursor-pointer font-bold ml-auto mr-auto ${filter === 'receiving' && "underline underline-offset-2"}`}>Receiving</h2>
                    <h2 onClick={() => {
                        if (filter === 'receiving') {
                            setFilter('sending')
                        }
                    }} className={`text-2xl cursor-pointer font-bold ml-auto mr-auto ${filter === 'sending' && "underline underline-offset-2"}`}>Sending</h2>
                </div>
                <div className="flex w-full flex-col">
                    {
                        filter === 'receiving' ? orders.receiving.map((order) => (
                            <OrderComponent key={order.ID} order={order} />
                        )) : orders.sending.map((order) => (
                            <OrderComponent key={order.ID} order={order} />
                        ))
                    }
                    </div>  
            </div>
        </div>
    )
}

const mapStateToProps = (state: any) => {
    return {
      auth: state.auth,
    };
  };
  
  export default connect(mapStateToProps)(OrdersPage);
  