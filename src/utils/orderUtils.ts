import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
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
 * Fetch user orders from Firestore (non-real-time)
 * @param userId - The user ID to fetch orders for
 * @returns Promise resolving to an array of Order objects
 */
export const fetchUserOrders = async (userId: string): Promise<Order[]> => {
    try {
        const ordersRef = collection(db, "orders");
        
        // Try query with orderBy first
        try {
            const qWithOrderBy = query(
                ordersRef,
                where("userId", "==", userId),
                orderBy("createdAt", "desc")
            );
            
            const snapshot = await getDocs(qWithOrderBy);
            const ordersList: Order[] = [];
            snapshot.forEach((doc) => {
                ordersList.push({
                    id: doc.id,
                    ...doc.data(),
                } as Order);
            });
            return ordersList;
        } catch (error: any) {
            // If error is about missing index, use fallback query
            if (error?.code === 'failed-precondition' && error?.message?.includes('index')) {
                console.warn("Index not found, using fallback query (sorting in memory)");
                
                const qWithoutOrderBy = query(
                    ordersRef,
                    where("userId", "==", userId)
                );
                
                const snapshot = await getDocs(qWithoutOrderBy);
                const ordersList: Order[] = [];
                snapshot.forEach((doc) => {
                    ordersList.push({
                        id: doc.id,
                        ...doc.data(),
                    } as Order);
                });
                
                // Sort in memory
                return sortOrdersByDate(ordersList);
            }
            throw error;
        }
    } catch (error) {
        console.error("Error fetching user orders:", error);
        throw error;
    }
};



