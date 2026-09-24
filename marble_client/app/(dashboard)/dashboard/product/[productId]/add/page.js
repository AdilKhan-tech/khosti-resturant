"use client";

import { useParams } from "next/navigation";
import AddProductForm from "@/components/dashboard/product/AddProductForm";

export default function EditProductPage() {
  const { productId } = useParams();

  return <AddProductForm productId={productId} />;
}
