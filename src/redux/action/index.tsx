import type { Product } from "../../types/Product.type"

// For Add Item to Cart
export const addCart = (product: Product) => {
    return {
        type: "ADDITEM",
        payload: product
    }
}

// For Delete Item to Cart
export const delCart = (product: Product) => {
    return {
        type: "DELITEM",
        payload: product
    }
}

// For Loading Cart from Firebase
export const loadCart = (cart: Product[]) => {
    return {
        type: "LOAD_CART",
        payload: cart
    }
}

// For Clearing Cart
export const clearCart = () => {
    return {
        type: "CLEAR_CART",
        payload: null
    }
}