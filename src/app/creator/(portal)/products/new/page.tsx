import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CreatorProductForm } from "../ProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href="/creator/products" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-4">
          <ChevronLeft size={15} /> Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
        <p className="text-gray-400 text-sm mt-1">Create a new digital product to sell</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
        <CreatorProductForm mode="create" />
      </div>
    </div>
  );
}
