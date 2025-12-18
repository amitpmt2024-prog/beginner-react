import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
import { auth, db } from "../Firebase";
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
 * Custom hook to fetch and listen to user orders in real-time
 * @returns Object containing orders array, loading state, and error
 */
export const useUserOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const user = auth.currentUser;
        
        if (!user?.uid) {
            // setOrders([]);
            // setLoading(false);
            return;
        }

        const ordersRef = collection(db, "orders");
        
        // First, try query with orderBy (requires index)
        const qWithOrderBy = query(
            ordersRef,
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        // Fallback query without orderBy (no index required)
        const qWithoutOrderBy = query(
            ordersRef,
            where("userId", "==", user.uid)
        );

        let unsubscribe: (() => void) | null = null;

        // Try with orderBy first
        unsubscribe = onSnapshot(
            qWithOrderBy,
            (snapshot) => {
                const ordersList: Order[] = [];
                snapshot.forEach((doc) => {
                    ordersList.push({
                        id: doc.id,
                        ...doc.data(),
                    } as Order);
                });
                setOrders(ordersList);
                setLoading(false);
                setError(null);
            },
            (err: { code?: string; message?: string }) => {
                // Check if error is about missing index
                if (err?.code === 'failed-precondition' && err?.message?.includes('index')) {
                    console.warn("Index not found, using fallback query (sorting in memory)");
                    
                    // Use fallback query without orderBy
                    unsubscribe?.();
                    unsubscribe = onSnapshot(
                        qWithoutOrderBy,
                        (snapshot) => {
                            const ordersList: Order[] = [];
                            snapshot.forEach((doc) => {
                                ordersList.push({
                                    id: doc.id,
                                    ...doc.data(),
                                } as Order);
                            });
                            // Sort in memory
                            const sortedOrders = sortOrdersByDate(ordersList);
                            setOrders(sortedOrders);
                            setLoading(false);
                            setError(null);
                        },
                        (fallbackErr) => {
                            console.error("Error in fallback query:", fallbackErr);
                            setError(fallbackErr as Error);
                            setLoading(false);
                        }
                    );
                } else {
                    console.error("Error listening to orders:", err);
                    setError(err as Error);
                    setLoading(false);
                }
            }
        );

        // Cleanup listener on unmount
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    return { orders, loading, error };
};

/**
 * Custom hook to fetch user orders once (non-real-time)
 * @returns Object containing orders array, loading state, and error
 */
export const useUserOrdersOnce = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            const user = auth.currentUser;
            
            if (!user?.uid) {
                setOrders([]);
                setLoading(false);
                return;
            }

            try {
                const { fetchUserOrders } = await import("../utils/orderUtils");
                const ordersList = await fetchUserOrders(user.uid);
                setOrders(ordersList);
                setLoading(false);
                setError(null);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError(err as Error);
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return { orders, loading, error };
};
