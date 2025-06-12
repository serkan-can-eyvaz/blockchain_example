import axios from 'axios';

const API_URL = 'http://localhost:8080/api/transactions';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getTransactions = async () => {
  const response = await axios.get(API_URL, getAuthHeader());
  return response.data;
};

export const getTransactionById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

export const createTransaction = async (transactionData) => {
  const response = await axios.post(API_URL, transactionData, getAuthHeader());
  return response.data;
};

export const updateTransaction = async (id, transactionData) => {
  const response = await axios.put(`${API_URL}/${id}`, transactionData, getAuthHeader());
  return response.data;
};

export const deleteTransaction = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

export const getTransactionsByProduct = async (productId) => {
  const response = await axios.get(`${API_URL}/product/${productId}`, getAuthHeader());
  return response.data;
};

export const getTransactionsByUser = async (userId) => {
  const response = await axios.get(`${API_URL}/user/${userId}`, getAuthHeader());
  return response.data;
};

export const getTransactionsByType = async (type) => {
  const response = await axios.get(`${API_URL}/type/${type}`, getAuthHeader());
  return response.data;
};

export const addTransaction = async (transaction) => (await axios.post(`${API_URL}/add`, transaction)).data;
export const mineTransactions = async () => (await axios.post(`${API_URL}/mine`)).data; 