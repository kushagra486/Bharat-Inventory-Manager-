export type ShopVM = {
  id: string;
  name: string;
  deliveryEstimate: string | null;
  serviceArea: string | null;
  upiId: string | null;
  productCount: number;
  categoryIcons: string[];
};

export type CategoryVM = {
  id: string;
  name: string;
  icon: string;
};

export type ProductVM = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryIcon: string;
  ownerId: string;
  shopName: string;
  deliveryEstimate: string | null;
};

export type CartLine = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  categoryIcon: string;
  ownerId: string;
  shopName: string;
  deliveryEstimate: string | null;
};

export type CustomerProfileVM = {
  id: string;
  name: string;
  phone: string | null;
  loyaltyPoints: number;
};

export type OrderItemVM = {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderVM = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  shopName: string;
  items: OrderItemVM[];
  deliveryStatus: string | null;
  deliveryLat: number | null;
  deliveryLng: number | null;
};

export type Screen = "home" | "search" | "cart" | "orders" | "profile";
