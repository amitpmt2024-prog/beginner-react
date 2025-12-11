/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Product } from "../../types/Product.type";

// Retrieve initial state from localStorage if available
const getInitialCart = () => {
  const storedCart = localStorage.getItem("cart");
  return storedCart ? JSON.parse(storedCart) : [];
};

const handleCart = (state = getInitialCart(), action:any) => {
  console.log('aaaaaa',state,action);
  const product = action.payload;
  let updatedCart;

  switch (action.type) {
    case "ADDITEM":
      { const exist = state.find((x:Product) => x.id === product.id);
      if (exist) {
        // Increase the quantity
        updatedCart = state.map((x:any) =>
          x.id === product.id ? { ...x, qty: x.qty + 1 } : x
        );
      } else {
        updatedCart = [...state, { ...product, qty: 1 }];
      }
      // Update localStorage
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart; }

    case "DELITEM":
      { const exist2 = state.find((x:Product) => x.id === product.id);
      if (exist2.qty === 1) {
        updatedCart = state.filter((x:any) => x.id !== exist2.id);
      } else {
        updatedCart = state.map((x:any) =>
          x.id === product.id ? { ...x, qty: x.qty - 1 } : x
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
