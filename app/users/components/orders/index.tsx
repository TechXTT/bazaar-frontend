import { productsService } from "@/api"
import { IOrder } from "@/api/interfaces/products"
import { useEffect, useState } from "react"
import { connect } from "react-redux"
import OrderComponent from "./components/order"


const OrdersPage = (props: any) => {

    const [orders, setOrders] = useState<IOrder[]>([])

    useEffect(() => {
        const fetch = async () => {
            const res = await productsService.getOrders(props.auth.jwt)
            console.log('res', res)
            if (res.status === 200) {
                setOrders(res.data)
            }
        }   
        
        fetch()
    }, [])

    return (
        <div className="flex w-5/6 p-4 flex-col ">
            {
                orders.map((order) => (
                    <OrderComponent order={order} />
                ))
            }
        </div>
    )
}

const mapStateToProps = (state: any) => {
    return {
      auth: state.auth,
    };
  };
  
  export default connect(mapStateToProps)(OrdersPage);
  