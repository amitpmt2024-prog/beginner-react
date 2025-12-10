interface Product {
    id?: string,
    title?: string,
    price?: number,
    description?: string,
    category?: string,
    image?: string,
    rating?: {
        rate?: number,
        count?: number
    }
}


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