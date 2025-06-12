import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import transactionReducer from './store/slices/transactionSlice';
import productReducer from './store/slices/productSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
    products: productReducer,
  },
});

export default store; 