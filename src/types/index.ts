export type BlockType =
  | "hero"
  | "text"
  | "image"
  | "video"
  | "testimonial"
  | "faq"
  | "countdown"
  | "divider"
  | "bullet_list"
  | "order_bump";

export interface Block {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  page_blocks: Block[];
  price_kobo: number;
  compare_at_kobo: number | null;
  currency: string;
  delivery_type: "magic_link" | "file";
  external_url: string | null;
  file_ref: string | null;
  active: boolean;
  created_at: string;
}

export interface BumpProduct {
  id: string;
  name: string;
  price_kobo: number;
  description?: string;
}

export type OrderStatus = "pending" | "paid" | "failed" | "refunded";
