import type { Product } from "../../types/Product.type"

// For Add Item to Cart
export const addCart = (product:Product) =>{
    return {
        type:"ADDITEM",
        payload:product
    }
}

// For Delete Item to Cart
export const delCart = (product:Product) =>{
    return {
        type:"DELITEM",
        payload:product
    }
}