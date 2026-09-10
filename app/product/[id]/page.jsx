import { notFound } from "next/navigation";
import { getProductById } from "@/lib/firebaseAdmin";
import ProductDetailClient from "./ProductDetailClient";

export const revalidate = 60;

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient id={id} product={product} />;
}
