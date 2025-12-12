
import type { Product } from "../../types/Product.type";

// Retrieve initial state from localStorage if available
const getInitialCart = () => {
  const storedCart = localStorage.getItem("cart");
  return storedCart ? JSON.parse(storedCart) : [];
};

const handleCart = (state = getInitialCart(), action:{type: string, payload: Product}) => {
  const product = action.payload;
  let updatedCart;

  switch (action.type) {
    case "ADDITEM":
      { const exist = state.find((x:Product) => x.id === product.id);
      if (exist) {
        // Increase the quantity
        updatedCart = state.map((x:Product) =>
          x.id === product.id ? { ...x, qty: (x.qty ?? 0) + 1 } : x
        );
        console.log('exist',state);
      } else {
        updatedCart = [...state, { ...product, qty: 1 }];
      }
      console.log('eeeeeeeee',updatedCart);
      // Update localStorage
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart; }

    case "DELITEM":
      { const exist2 = state.find((x:Product) => x.id === product.id);
      if (exist2.qty === 1) {
        updatedCart = state.filter((x:Product) => x.id !== exist2.id);
      } else {
        updatedCart = state.map((x:Product) =>
          x.id === product.id ? { ...x, qty: (x.qty ?? 0) - 1 } : x
        );
      }
      // Update localStorage
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart; }

    default:
      return state;
  }
};

export default handleCart;
