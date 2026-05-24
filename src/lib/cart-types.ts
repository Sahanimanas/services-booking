export type ServiceCartItem = {
  kind: "service";
  cartId: string; // client-side id for keying
  serviceId: string;
  slug: string;
  title: string;
  imageUrl?: string | null;
  unitCents: number; // already discounted
  localityId: string;
  localityName: string;
  address: string;
  contactName: string;
  contactPhone: string;
  scheduledAt: string; // ISO
  notes?: string;
};

export type ProductCartItem = {
  kind: "product";
  cartId: string;
  productId: string;
  slug: string;
  title: string;
  imageUrl?: string | null;
  unitCents: number; // already discounted
  qty: number;
};

export type CartItem = ServiceCartItem | ProductCartItem;
