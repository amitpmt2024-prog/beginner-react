import { Timestamp } from "firebase/firestore";
import type { Product } from "./Product.type";

export interface OrderAddress {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    address2?: string;
    country: string;
    state: string;
    zip: string;
}

export interface Order {
    id?: string;
    userId: string;
    userEmail: string;
    items: Product[];
    address: OrderAddress;
    subTotal: number;
    shipping: number;
    total: number;
    totalItems: number;
    status: string;
    createdAt: Timestamp | Date;
}



