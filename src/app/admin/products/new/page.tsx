import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-sm mb-6">
          <Link href="/admin/products" className="text-gray-400 hover:text-gray-600">My Store</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800 font-semibold">Add New Product</span>
        </div>
      </div>
      <ProductForm />
    </div>
  );
}
