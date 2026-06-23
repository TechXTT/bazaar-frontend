import type { Metadata } from "next";
import { CONFIG } from "@/config/config";
import { IProduct } from "@/api/interfaces/products";
import ProductDetail from "./product-detail";

// FE-6: server component wrapper that provides per-product SEO metadata. The
// interactive detail UI (cart, redux auth, owner edit) remains a client island.
async function fetchProduct(id: string): Promise<IProduct | null> {
  try {
    const res = await fetch(`${CONFIG.BACKEND_URL}/api/products/${id}`, {
      // Product listings change rarely; revalidate periodically for fresh metadata.
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as IProduct;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const product = await fetchProduct(params.id);
  if (!product) return { title: "Product" };
  return {
    title: product.Name,
    description:
      product.Description?.slice(0, 160) ||
      `${product.Name} on The Bazaar — escrow-protected purchase.`,
    openGraph: {
      title: product.Name,
      description: product.Description?.slice(0, 160) || undefined,
      images: product.ImageURL
        ? [`${CONFIG.CDN_BASE_URL}/${product.ImageURL}`]
        : undefined,
    },
  };
}

export default function ProductPage() {
  return <ProductDetail />;
}
