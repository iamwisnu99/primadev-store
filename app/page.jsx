import { getProductsFromDb } from "@/lib/firebaseAdmin";
import StoreClientView from "./StoreClientView";

export const revalidate = 60; // ISR revalidate every 60s

export default async function StorePage() {
  const products = await getProductsFromDb();
  return <StoreClientView initialProducts={products} />;
}
