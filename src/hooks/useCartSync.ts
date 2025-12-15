import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch } from "react-redux";
import { auth } from "../Firebase";
import { fetchCartFromFirebase } from "../redux/reducer/HandleCart";
import { loadCart, clearCart } from "../redux/action";

/**
 * Custom hook to sync cart with Firebase
 * Loads cart from Firebase when user logs in
 * Clears cart when user logs out
 */
export const useCartSync = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is logged in - fetch cart from Firebase
        try {
          const cart = await fetchCartFromFirebase(user.uid);
          dispatch(loadCart(cart));
        } catch (error) {
          console.error("Error loading cart from Firebase:", error);
        }
      } else {
        // User is logged out - clear cart
        dispatch(clearCart());
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [dispatch]);
};

