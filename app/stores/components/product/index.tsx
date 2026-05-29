import { IProduct } from "@/api/interfaces/products";
import BucketImage from "@/app/components/image";
import Link from "next/link";

const ProductCard = ({ product }: { product: IProduct }) => (
  <Link
    href={`/products/${product.ID}`}
    className="group flex flex-col rounded-xl border border-border-subtle bg-bg-secondary overflow-hidden hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/5"
  >
    <div className="aspect-square overflow-hidden">
      <BucketImage
        imageURL={product.ImageURL}
        name={product.Name}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
    <div className="p-3 space-y-1">
      <h2 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-white transition-colors">
        {product.Name}
      </h2>
      <p className="text-sm font-medium text-primary">
        {product.Price} {product.Unit}
      </p>
    </div>
  </Link>
);

export default ProductCard;
