import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";

const toastOptions = {
  style: {
    borderRadius: '10px',
    background: '#333',
    color: '#fff',
  },
};

const initialState = {
  cart: localStorage.getItem("cart")
    ? JSON.parse(localStorage.getItem("cart"))
    : [],
  total: localStorage.getItem("total")
    ? JSON.parse(localStorage.getItem("total"))
    : 0,
  totalItems: localStorage.getItem("totalItems")
    ? JSON.parse(localStorage.getItem("totalItems"))
    : 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const index = state.cart.findIndex((cartItem) => cartItem._id === item._id);

      if (index >= 0) {
        toast.error(`${item.seriesName ? "Mock test" : "Course"} already in cart`, toastOptions);
        return;
      }

      state.cart.push(item);
      state.totalItems++;
      state.total += item.price;

      localStorage.setItem("cart", JSON.stringify(state.cart));
      localStorage.setItem("total", JSON.stringify(state.total));
      localStorage.setItem("totalItems", JSON.stringify(state.totalItems));

      toast.success(`${item.seriesName ? "Mock test" : "Course"} added to cart`, toastOptions);
    },

    removeFromCart: (state, action) => {
      const itemId = action.payload;
      const index = state.cart.findIndex((item) => item._id === itemId);

      if (index >= 0) {
        const removedItem = state.cart[index];
        state.totalItems--;
        state.total -= removedItem.price;
        state.cart.splice(index, 1);

        localStorage.setItem("cart", JSON.stringify(state.cart));
        localStorage.setItem("total", JSON.stringify(state.total));
        localStorage.setItem("totalItems", JSON.stringify(state.totalItems));

        toast.success(`${removedItem.seriesName ? "Mock test" : "Course"} removed from cart`, toastOptions);
      }
    },

    resetCart: (state) => {
      state.cart = [];
      state.total = 0;
      state.totalItems = 0;

      localStorage.removeItem("cart");
      localStorage.removeItem("total");
      localStorage.removeItem("totalItems");
    },
  },
});

export const { addToCart, removeFromCart, resetCart } = cartSlice.actions;

export default cartSlice.reducer;
