import Link from "next/link";

const ProductCard = (props: any) => {
  const { product } = props;

  return (
    <Link
      href={`/products/${product.ID}`}
      key={product.ID}
      className="flex flex-col w-72 h-96 p-2 m-2 bg-[#627C7F] rounded-lg shadow-md"
    >
      <div className="flex flex-col w-full h-full overflow-hidden">
        <img
          src={
            "https://bucket-for-bazaar.fra1.cdn.digitaloceanspaces.com/" +
            product.ImageURL
          }
          alt={product.Name}
          className="h-64 object-cover rounded-lg"
        />

        <div className="flex flex-col w-full h-full justify-end">
          <p className="text-xl mt-1">
            {product.Price} {product.Unit}
          </p>
          <h2 className="text-xl font-bold text-ellipsis text-left">
            {product.Name}
          </h2>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
