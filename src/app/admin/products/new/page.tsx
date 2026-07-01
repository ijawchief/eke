import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/admin/products" className="flex items-center gap-1 text-white/40 hover:text-white text-sm mb-4 transition-colors">
          <ChevronLeft size={16} />
          Products
        </Link>
        <h1 className="text-2xl font-bold">New Product</h1>
      </div>
      <ProductForm />
    </div>
  );
}
