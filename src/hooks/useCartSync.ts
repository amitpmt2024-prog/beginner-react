import { useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch } from "react-redux";
import { auth } from "../Firebase";
import { fetchCartFromFirebase, syncCartToFirebase } from "../redux/reducer/HandleCart";
import { loadCart } from "../redux/action";
import type { Product } from "../types/Product.type";

/**
 * Merge local cart with Firebase cart
 * If same product exists in both, use the maximum quantity (to avoid doubling)
 * This handles the case where Login.tsx already synced the cart
 */
const mergeCarts = (localCart: Product[], firebaseCart: Product[]): Product[] => {
  const mergedMap = new Map<string, Product>();

  // First, add all Firebase cart items (Firebase is source of truth if it has items)
  firebaseCart.forEach((product) => {
    const productId = product?.id?.toString();
    if (productId) {
      mergedMap.set(productId, { ...product });
    }
  });

  // Then, merge local cart items
  localCart.forEach((product) => {
    const productId = product?.id?.toString();
    if (productId) {
      const existing = mergedMap.get(productId);
      if (existing) {
        // Product exists in both - use the maximum quantity to avoid doubling
        // This handles the case where Login.tsx already synced the cart
        mergedMap.set(productId, {
          ...existing,
          qty: Math.max(existing.qty || 0, product.qty || 0),
        });
      } else {
        // Product only in local cart - add it
        mergedMap.set(productId, { ...product });
      }
    }
  });

  return Array.from(mergedMap.values());
};

/**
 * Custom hook to sync cart with Firebase
 * Merges local cart with Firebase cart when user logs in
 * Clears cart when user logs out
 */
export const useCartSync = () => {
  const dispatch = useDispatch();
  const previousUserIdRef = useRef<string | null>(null);
  const hasMergedRef = useRef<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if this is a new login (user changed)
        const isNewLogin = previousUserIdRef.current !== user.uid;
        
        if (isNewLogin) {
          previousUserIdRef.current = user.uid;
          hasMergedRef.current = false;
        }

        // Only merge once per login session
        if (isNewLogin && !hasMergedRef.current) {
          hasMergedRef.current = true;
          
          try {
            // Get local cart from localStorage
            const localCartData = localStorage.getItem("cart");
            const localCart: Product[] = localCartData 
              ? JSON.parse(localCartData) 
              : [];

            // Fetch cart from Firebase
            const firebaseCart = await fetchCartFromFirebase(user.uid);

            // Merge carts (local cart takes priority for new items, use max quantity for existing)
            const mergedCart = mergeCarts(localCart, firebaseCart);

            // If there were items in local cart, sync merged cart to Firebase
            if (localCart.length > 0) {
              await syncCartToFirebase(user.uid, mergedCart);
            } else if (firebaseCart.length > 0) {
              // If no local cart but Firebase has items, just use Firebase cart
              dispatch(loadCart(firebaseCart));
              return;
            }

            // Update Redux store with merged cart
            dispatch(loadCart(mergedCart));
          } catch (error) {
            console.error("Error syncing cart with Firebase:", error);
            hasMergedRef.current = false; // Reset on error so we can retry
          }
        }
      } else {
        // User is logged out - reset tracking
        previousUserIdRef.current = null;
        hasMergedRef.current = false;
        // dispatch(clearCart());
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [dispatch]);
};





