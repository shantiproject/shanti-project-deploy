export type User = {
  id: string; // UUID
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  pet_information: string;
  delivery_allowed: boolean;
  created_at: Date; // timestamp of when record was created
  cart_id: number; // UUID
  address_id: string; // UUID
  fav_items: number[]; // JSONB with item as key and quantity as value
  num_pets: number; // Integer value containing number of pets
  phone_numbers: string; // User's phone number for pick up orders
  pet_prescription: string[]; // JSONB with pet_name as key and perscription as value
  delivery_group: number; // When someone's order will be delivered
};

export enum OrderStatus {
  inProgress = 'In Progress',
  Submitted = 'Submitted',
  Complete = 'Confirmed',
  Rejected = 'Rejected',
}

export type Order = {
  id: number; // bigint generated by default as identity
  user_id: string; // UUID not null
  order_status: OrderStatus; // Enum type OrderStatus
  pickup_time_id: number; // bigint null
  created_at: string; // timestamp with time zone not null default now();
  order_product_id_array: number[];
};

export type Pickup = {
  id: number; // bigint generated by default as identity
  date: Date; // text not null
  start_time: Date; // text null
};

export type Product = {
  id: number; // bigint generated by default as identity
  name: string; // text not null;
  description: string; // text null;
  category: string; // numeric not null;
  quantity: number; // numeric not null;
  photo: string; // text null;
  updated_at: Date; // timestamp with time zone not null default now();
  Prescribed: boolean;
};

export type Cart = {
  id: number; // bigint generated by default as identity
  user_id: string; // UUID not null
  product_id: Record<string, number>; // JSONB with item as key and quantity as value
};

export type OrderProduct = {
  id: number;
  quantity: number;
  product_id: number;
};

export type ProductWithQuantity = {
  name: string;
  quantity: number; // product quantity within the cart
  photo: string;
  id: number;
  category: string;
};

export type Address = {
  id: number;
  created_at: Date;
  street: string;
  city: string;
  zipcode: string;
  user_id: number;
};

export type StorefrontButtons = {
  id: number;
  name: string;
};

export type DeliveryTime = {
  delivery_group: number;
  delivery_time: Date;
};
