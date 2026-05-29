import { IProduct } from "@/api/interfaces/products";
import BucketImage from "@/app/components/image";
import Link from "next/link";
import { FiImage } from "react-icons/fi";

const ProductCard = ({ product }: { product: IProduct }) => (
  <Link
    href={`/products/${product.ID}`}
    className="group flex flex-col rounded-xl border border-border-subtle bg-bg-secondary overflow-hidden hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/5"
  >
    <div className="aspect-square overflow-hidden bg-surface-sunken relative">
      {product.ImageURL ? (
        <BucketImage
          imageURL={product.ImageURL}
          name={product.Name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <FiImage size={36} className="text-text-muted" />
        </div>
      )}
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
