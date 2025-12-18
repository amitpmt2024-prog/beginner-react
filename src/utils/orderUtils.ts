import { collection, query, where, getDocs, orderBy, QueryConstraint, Timestamp } from "firebase/firestore";
import { db } from "../Firebase";
import type { Order } from "../types/Order.type";

/**
 * Helper function to sort orders by createdAt in descending order
 */
const sortOrdersByDate = (orders: Order[]): Order[] => {
    return orders.sort((a, b) => {
        const dateA = a.createdAt instanceof Timestamp 
            ? a.createdAt.toMillis() 
            : a.createdAt instanceof Date 
            ? a.createdAt.getTime() 
            : 0;
        const dateB = b.createdAt instanceof Timestamp 
            ? b.createdAt.toMillis() 
            : b.createdAt instanceof Date 
            ? b.createdAt.getTime() 
            : 0;
        return dateB - dateA; // Descending order (newest first)
    });
};

/**
 * Fetch all orders for a specific user
 * @param userId - The user ID to fetch orders for
 * @returns Array of orders for the user, sorted by creation date (newest first)
 */
export const fetchUserOrders = async (userId: string): Promise<Order[]> => {
    try {
        const ordersRef = collection(db, "orders");
        
        // Try query with orderBy first (requires index)
        const qWithOrderBy = query(
            ordersRef,
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );
        
        try {
            const querySnapshot = await getDocs(qWithOrderBy);
            const orders: Order[] = [];
            querySnapshot.forEach((doc) => {
                orders.push({
                    id: doc.id,
                    ...doc.data(),
                } as Order);
            });
            return orders;
        } catch (error: unknown) {
            // If index error, use fallback query without orderBy
            const firestoreError = error as { code?: string; message?: string };
            if (firestoreError?.code === 'failed-precondition' && firestoreError?.message?.includes('index')) {
                console.warn("Index not found, using fallback query (sorting in memory)");
                
                const qWithoutOrderBy = query(
                    ordersRef,
                    where("userId", "==", userId)
                );
                
                const querySnapshot = await getDocs(qWithoutOrderBy);
                const orders: Order[] = [];
                querySnapshot.forEach((doc) => {
                    orders.push({
                        id: doc.id,
                        ...doc.data(),
                    } as Order);
                });
                
                // Sort in memory
                return sortOrdersByDate(orders);
            }
            throw error;
        }
    } catch (error) {
        console.error("Error fetching user orders:", error);
        throw error;
    }
};

/**
 * Fetch a single order by order ID
 * @param orderId - The order ID to fetch
 * @returns Order object or null if not found
 */
export const fetchOrderById = async (orderId: string): Promise<Order | null> => {
    try {
        const { doc, getDoc } = await import("firebase/firestore");
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        
        if (orderSnap.exists()) {
            return {
                id: orderSnap.id,
                ...orderSnap.data(),
            } as Order;
        }
        
        return null;
    } catch (error) {
        console.error("Error fetching order by ID:", error);
        throw error;
    }
};

/**
 * Fetch orders with additional filters
 * @param userId - The user ID to fetch orders for
 * @param status - Optional status filter
 * @param limit - Optional limit on number of orders to fetch
 * @returns Array of filtered orders
 */
export const fetchUserOrdersWithFilters = async (
    userId: string,
    status?: Order["status"],
    limit?: number
): Promise<Order[]> => {
    try {
        const ordersRef = collection(db, "orders");
        
        // Build constraints
        const constraints: QueryConstraint[] = [
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        ];
        
        if (status) {
            constraints.push(where("status", "==", status));
        }
        
        const qWithOrderBy = query(ordersRef, ...constraints);
        
        try {
            const querySnapshot = await getDocs(qWithOrderBy);
            const orders: Order[] = [];
            querySnapshot.forEach((doc) => {
                orders.push({
                    id: doc.id,
                    ...doc.data(),
                } as Order);
            });
            
            // Apply limit if specified
            return limit ? orders.slice(0, limit) : orders;
        } catch (error: unknown) {
            // If index error, use fallback query without orderBy
            const firestoreError = error as { code?: string; message?: string };
            if (firestoreError?.code === 'failed-precondition' && firestoreError?.message?.includes('index')) {
                console.warn("Index not found, using fallback query (sorting in memory)");
                
                const fallbackConstraints: QueryConstraint[] = [
                    where("userId", "==", userId)
                ];
                
                if (status) {
                    fallbackConstraints.push(where("status", "==", status));
                }
                
                const qWithoutOrderBy = query(ordersRef, ...fallbackConstraints);
                const querySnapshot = await getDocs(qWithoutOrderBy);
                const orders: Order[] = [];
                querySnapshot.forEach((doc) => {
                    orders.push({
                        id: doc.id,
                        ...doc.data(),
                    } as Order);
                });
                
                // Sort in memory
                const sortedOrders = sortOrdersByDate(orders);
                
                // Apply limit if specified
                return limit ? sortedOrders.slice(0, limit) : sortedOrders;
            }
            throw error;
        }
    } catch (error) {
        console.error("Error fetching filtered user orders:", error);
        throw error;
    }
};
