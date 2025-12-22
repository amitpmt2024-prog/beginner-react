import { useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { auth, db } from "../Firebase";
import { loadCart } from "../redux/action";
import type { Product } from "../types/Product.type";

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
          const cart: Product[] = Object.values(items) as Product[];
          dispatch(loadCart(cart));
          localStorage.setItem("cart", JSON.stringify(cart));
        } else {
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





