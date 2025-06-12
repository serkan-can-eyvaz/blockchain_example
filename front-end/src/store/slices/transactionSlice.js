import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  transactions: [],
  currentTransaction: null,
  loading: false,
  error: null,
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    fetchTransactionsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTransactionsSuccess: (state, action) => {
      state.loading = false;
      state.transactions = action.payload;
      state.error = null;
    },
    fetchTransactionsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentTransaction: (state, action) => {
      state.currentTransaction = action.payload;
    },
    addTransactionStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    addTransactionSuccess: (state, action) => {
      state.loading = false;
      state.transactions.push(action.payload);
      state.error = null;
    },
    addTransactionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateTransactionStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateTransactionSuccess: (state, action) => {
      state.loading = false;
      const index = state.transactions.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
      state.error = null;
    },
    updateTransactionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteTransactionStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteTransactionSuccess: (state, action) => {
      state.loading = false;
      state.transactions = state.transactions.filter(t => t.id !== action.payload);
      state.error = null;
    },
    deleteTransactionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    filterTransactionsByProduct: (state, action) => {
      state.transactions = state.transactions.filter(
        t => t.product.id === action.payload
      );
    },
    filterTransactionsByUser: (state, action) => {
      state.transactions = state.transactions.filter(
        t => t.user.id === action.payload
      );
    },
    filterTransactionsByType: (state, action) => {
      state.transactions = state.transactions.filter(
        t => t.type === action.payload
      );
    },
  },
});

export const {
  fetchTransactionsStart,
  fetchTransactionsSuccess,
  fetchTransactionsFailure,
  setCurrentTransaction,
  addTransactionStart,
  addTransactionSuccess,
  addTransactionFailure,
  updateTransactionStart,
  updateTransactionSuccess,
  updateTransactionFailure,
  deleteTransactionStart,
  deleteTransactionSuccess,
  deleteTransactionFailure,
  filterTransactionsByProduct,
  filterTransactionsByUser,
  filterTransactionsByType,
} = transactionSlice.actions;

export default transactionSlice.reducer; 