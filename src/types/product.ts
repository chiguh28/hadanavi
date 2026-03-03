export type ProductCategory =
  | "cleansing"
  | "face_wash"
  | "toner"
  | "serum"
  | "moisturizer"
  | "sunscreen";

export interface AffiliateUrls {
  amazon?: string;
  rakuten?: string;
  yahoo?: string;
}

export interface Product {
  product_id: string;
  name: string;
  brand: string;
  price: number;
  category: ProductCategory;
  key_point: string;
  sensitivity_safe: boolean;
  exclude_skin_types: string[];
  ceramide_type?: "human_type" | "pseudo";
  evidence_level: "cosmetic" | "quasi_drug";
  availability: "current" | "discontinued";
  concentration_note?: string;
  price_updated_at: string;
  affiliate_urls: AffiliateUrls;
  image_url?: string;
}

export interface ProductsByCategory {
  cleansing: Record<string, Product[]>;
  face_wash: Record<string, Product[]>;
  toner: Record<string, Product[]>;
  serum: Record<string, Product[]>;
  moisturizer: Record<string, Product[]>;
  sunscreen: Record<string, Product[]>;
}
