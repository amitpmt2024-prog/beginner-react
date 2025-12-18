import type { Product } from "./Product.type";
import { Timestamp } from "firebase/firestore";

export interface Address {
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
    address: Address;
    subTotal: number;
    shipping: number;
    total: number;
    totalItems: number;
    status: "delivered";
    createdAt: Timestamp | Date;
}
