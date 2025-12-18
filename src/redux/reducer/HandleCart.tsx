import { deleteField, doc, getDoc, increment, setDoc, updateDoc } from "firebase/firestore";
import type { Product } from "../../types/Product.type";
import { auth, db } from "../../Firebase";

/**
 * Sync a single product to Firebase cart
 */
const syncProductToFirebase = async (uid: string, product: Product, operation: 'add' | 'remove' | 'single remove') => {
  try {
    const cartRef = doc(db, "carts", uid);
    const cartSnap = await getDoc(cartRef);

    let items: Record<string, Product> = {};

    if (cartSnap.exists()) {
      items = cartSnap.data().items || {};
    }

    const productId = product?.id?.toString();
    if (!productId) {
      console.error("Product ID is missing");
      return;
    }

    if (operation === 'add') {
      if (items[productId]) {
        // Product exists → increment qty
        items[productId].qty = (items[productId].qty || 0) + 1;
      } else {
        // Product does not exist → add new
        items[productId] = {
          ...product,
          qty: 1,
        };
      }
      await setDoc(
        cartRef,
        {
          items,
        },
        { merge: true }
      );
    } 
    if (operation === "remove") {
      if (items[productId]?.qty === 1) {
        await updateDoc(cartRef, {
          [`items.${productId}`]: deleteField(),
        });
      } else {
        await updateDoc(cartRef, {
          [`items.${productId}.qty`]: increment(-1),
        });
      }
    } 
    if(operation === "single remove") {
       await updateDoc(cartRef, {
          [`items.${productId}`]: deleteField(),
        });
    }

  } catch (error) {
    console.error("Error syncing cart to Firebase:", error);
  }
};

/**
 * Sync entire cart array to Firebase
 */
export const syncCartToFirebase = async (uid: string, cart: Product[]) => {
  try {
    const cartRef = doc(db, "carts", uid);
    const items: Record<string, Product> = {};

    // Convert cart array to object format
    cart.forEach((product) => {
      const productId = product?.id?.toString();
      if (productId) {
        items[productId] = product;
      }
    });

    await setDoc(
      cartRef,
      {
        items,
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error syncing cart to Firebase:", error);
  }
};

/**
 * Fetch cart from Firebase
 */
export const fetchCartFromFirebase = async (uid: string): Promise<Product[]> => {
  try {
    const cartRef = doc(db, "carts", uid);
    const cartSnap = await getDoc(cartRef);

    if (cartSnap.exists()) {
      const data = cartSnap.data();
      const items = data.items || {};
      // Convert object to array
      return Object.values(items) as Product[];
    }
    return [];
  } catch (error) {
    console.error("Error fetching cart from Firebase:", error);
    return [];
  }
};

/**
 * Retrieve initial state from localStorage if available
 */
const getInitialCart = (): Product[] => {
  try {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    console.error("Error parsing cart from localStorage:", error);
    return [];
  }
};

/**
 * Cart reducer
 */
const handleCart = (
  state: Product[] = getInitialCart(),
  action: { type: string; payload?: Product | Product[] }
): Product[] => {
  let updatedCart: Product[];

  switch (action.type) {
    case "ADDITEM": {
      if (!action.payload || !(action.payload as Product).id) {
        return state;
      }

      const product = action.payload as Product;

      const exist = state.find((x: Product) => x.id === product.id);
      if (exist) {
        // Increase the quantity
        updatedCart = state.map((x: Product) =>
          x.id === product.id ? { ...x, qty: (x.qty ?? 0) + 1 } : x
        );
      } else {
        updatedCart = [...state, { ...product, qty: 1 }];
      }

      // Update localStorage
      localStorage.setItem("cart", JSON.stringify(updatedCart));

      // Sync to Firestore (async, fire & forget)
      if (auth.currentUser?.uid) {
        syncProductToFirebase(auth.currentUser.uid, product, 'add').catch(console.error);
      }

      return updatedCart;
    }

    case "DELITEM": {
      if (!action.payload || !(action.payload as Product).id) {
        return state;
      }

      const product = action.payload as Product;
      const exist: Product | undefined = state.find((x: Product) => x.id === product.id);

      if (!exist) {
        return state;
      }

      if (exist.qty === 1) {
        updatedCart = state.filter((x: Product) => x.id !== exist.id);
      } else {
        updatedCart = state.map((x: Product) =>
          x.id === product.id ? { ...x, qty: (x.qty ?? 0) - 1 } : x
        );
      }

      // Update localStorage
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      // Sync to Firestore (async, fire & forget)
      if (auth.currentUser?.uid) {
        syncProductToFirebase(auth.currentUser.uid, product, 'remove').catch(console.error);
      }

      return updatedCart;
    }

    case "LOAD_CART": {
      // Load cart from Firebase (used when user logs in)
      if (Array.isArray(action.payload)) {
        updatedCart = action.payload;
        // Update localStorage
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        return updatedCart;
      }
      return state;
    }

    case "CLEAR_CART": {
      updatedCart = [];
      localStorage.removeItem("cart");
      // Clear Firebase cart if user is logged in
      if (auth.currentUser?.uid) {
        syncCartToFirebase(auth.currentUser.uid, []).catch(console.error);
      }
      return updatedCart;
    }

    case "DEL_SINGLE_ITEM": {
      if (!action.payload || !(action.payload as Product).id) {
        return state;
      }

      const product = action.payload as Product;
      const exist: Product | undefined = state.find((x: Product) => x.id === product.id);

      if (!exist) {
        return state;
      }
      updatedCart = state.filter((x: Product) => x.id !== exist.id);
      // Update localStorage
      localStorage.setItem("cart", JSON.stringify(updatedCart));

      // Sync to Firestore (async, fire & forget)
      if (auth.currentUser?.uid) {
        syncProductToFirebase(auth.currentUser.uid, product, 'single remove').catch(console.error);
      }
      return updatedCart;
    }
    default:
      return state;
  }
    
      
};

export default handleCart;
