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
};

export type CartLine = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  categoryIcon: string;
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
  items: OrderItemVM[];
};

export type Screen = "home" | "search" | "cart" | "orders" | "profile";
