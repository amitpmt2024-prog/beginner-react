import { useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { auth, db } from "../Firebase";
import { loadCart } from "../redux/action";
import type { Product } from "../types/Product.type";

/**
 * Custom hook to listen to real-time cart changes from Firebase
 * Updates Redux store when Firebase cart changes
 */
export const useCartListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const user = auth.currentUser;
    
    if (!user?.uid) {
      return;
    }

    const cartRef = doc(db, "carts", user.uid);

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      cartRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const items = data.items || {};
          // Convert object to array
          const cart: Product[] = Object.values(items) as Product[];
          
          // Update Redux store with Firebase data
          dispatch(loadCart(cart));
          
          // Also update localStorage for offline support
          localStorage.setItem("cart", JSON.stringify(cart));
        } else {
          // Cart doesn't exist in Firebase, clear local state
          dispatch(loadCart([]));
          localStorage.removeItem("cart");
        }
      },
      (error) => {
        console.error("Error listening to cart changes:", error);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [dispatch]);
};


