import { productsService } from "@/api";
import { IProduct } from "@/api/interfaces/products";
import { addItemsToCart } from "@/redux/slices/auth-slice";
import { useAppDispatch } from "@/redux/store";
import { useEffect, useState } from "react";
import { GrAdd, GrSubtract } from "react-icons/gr";
import { connect } from "react-redux";

const AddToCart = (props: any) => {

    const { product, productData, edit, setEdit, setProduct } = props;

    const dispatch = useAppDispatch();

    const [amount, setAmount] = useState<number>(1);

  const handleAdd = () => {
    setAmount(amount + 1);
  };

  const handleSubtract = () => {
    if (amount > 1) {
      setAmount(amount - 1);
    }
  };

  useEffect(() => {
    if (product.Store.OwnerID === props.auth.user.ID) {
      setEdit(true);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (props.auth.isLoggedIn && props.auth.cart !== null) {
      let products = JSON.parse(JSON.stringify(props.auth.cart.products));
      const total = props.auth.cart.total + (product.Price * amount);
      if (products.length > 0) {
        const productIndex = products.findIndex(
          (p: IProduct) => p.ID === product.ID
        );
        if (productIndex > -1) {
          products[productIndex].Quantity += amount;
        } else {
          products.push({ ...product, Quantity: amount });
        }
      } else {
        products.push({ ...product, Quantity: amount });
      }
      dispatch(addItemsToCart({ products, total }));
      console.log("cart", { products, total });
    } else if (props.auth.isLoggedIn && props.auth.cart === null) {
      let products = [];
      let total = product.Price;
      products.push({ ...product, Quantity: amount });
      dispatch(addItemsToCart({ products, total }));
      console.log("cart", { products, total });
    }
  };

  if (edit) {
    return (
        <div className="flex flex-row space-x-4">
          
          <button
            className="text-2xl text-balance font-bold mt-4 bg-[#182628] rounded px-2 py-1"
            onClick={async () => {
              setEdit(false);
              const res = await productsService.updateProduct(product, props.auth.jwt);
                if (res.status === 200) {
                    setProduct(product);
                }
            }}
          >
            Save
          </button>

          <button
            className="text-2xl text-balance font-bold mt-4 bg-[#182628] rounded px-2 py-1"
            onClick={() => {
              setProduct(productData);
            }}
          >
            Cancel
          </button>
        </div>
      )
  }
    return (
        <div className="flex flex-col h-full justify-self-end content-evenly w-1/3 rounded-lg shadow p-4 bg-[#627C7F]">
          <div className="flex flex-row justify-between">
            <p className="text-3xl -mt-1 mb-8 font-bold text-left">Price: </p>
            <p className="text-2xl mb-8 text-left">
              {product.Price * amount} {product.Unit}
            </p>
          </div>
          <div className="flex h-1/2 flex-row content-center space-x-2">
            <p className="text-2xl font-bold -mt-1 text-left">Quantity: </p>
            <div className="flex flex-row w-full justify-center space-x-8">
              <div onClick={handleSubtract}>
                <GrSubtract className="text-2xl" />
              </div>
              <p className="text-2xl -mt-1">{amount}</p>
              <div onClick={handleAdd}>
                <GrAdd className="text-2xl" />
              </div>
            </div>
          </div>
          <div className="flex flex-row w-full">
            <button onClick={handleAddToCart} className="bg-[#324B4E] w-full text-xl text-white p-2 rounded-md">
              Add to Cart
            </button>
          </div>
        </div>
    )
}

const mapStateToProps = (state: any) => {
    return {
      auth: state.auth,
    };
  }

export default connect(mapStateToProps)(AddToCart);