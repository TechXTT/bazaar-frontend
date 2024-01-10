import { IProduct } from "@/api/interfaces/products"
import { addItemsToCart } from "@/redux/slices/auth-slice";
import { useAppDispatch } from "@/redux/store";
import { connect } from "react-redux"

const ProductCard = (props: any) => {

    const { product }  = props;

    const dispatch = useAppDispatch();

    const handleAddToCart = () => {
        if (props.auth.isLoggedIn && props.auth.cart !== null) {
            let products = JSON.parse(JSON.stringify(props.auth.cart.products));
            const total = props.auth.cart.total + product.Price;
            if (products.length > 0) {
                const productIndex = products.findIndex((p: IProduct) => p.ID === product.ID);
                if (productIndex > -1) {
                    products[productIndex].Quantity++;

                } else {
                    products.push({...product, Quantity: 1});
                }
            }
            else {
                products.push({...product, Quantity: 1});
            }
            dispatch(addItemsToCart({products, total}));
            console.log('cart', {products, total})
        } else if (props.auth.isLoggedIn && props.auth.cart === null) {
            let products = [];
            let total = product.Price;
            products.push({...product, Quantity: 1});
            dispatch(addItemsToCart({products, total}));
            console.log('cart', {products, total})
        }
    }

    return (
        <div onClick={handleAddToCart} key={product.ID} className="flex flex-col w-72 justify-center p-2 m-2 bg-[#627C7F] rounded-lg shadow-md">
            <img src={product.ImageURL} alt={product.Name} className="w-72 h-72 rounded-lg" />
            <h2 className="text-xl font-bold text-left">{product.Name}</h2>
            <p className="text-lg text-right">{product.Price} {product.Unit}</p>
        </div>
    )
}

const mapStateToProps = (state: any) => {
    return {
      auth: state.auth,
    };
  }
  
export default connect(mapStateToProps)(ProductCard);