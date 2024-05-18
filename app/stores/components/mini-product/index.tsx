import BucketImage from "@/app/components/image";
import Link from "next/link";

const MiniProductCard = (props: any) => {
  const { product } = props;

  return (
    <Link
      href={`/products/${product.ID}`}
      key={product.ID}
      className="relative flex grow shrink-0 flex-col w-128 h-36 p-2 m-2 bg-[#416165] rounded-lg shadow-md opacity-80"
    >
      <div className="flex flex-col shrink-0 grow w-fit h-full min-h-0">
        <div className="relative shrink h-full min-h-0 w-full">
          <BucketImage
            key={product.ID}
            className="block h-full rounded-lg min-h-0 m-0 object-cover w-full"
            imageURL={product.ImageURL}
            name={product.Name}
          />
        </div>
        <p className="shrink-0 text-sm mt-1 min-h-0 w-full">
          {product.Name.length > 15 ? product.Name.substring(0, 15) + "..." : product.Name} - {product.Price} {product.Unit}
        </p>
      </div>
    </Link>
  );
};

export default MiniProductCard;
