import axios from 'axios';

const API_URL = 'http://localhost:8080/api/products';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return { headers };
};

export const getProducts = async () => {
  const response = await axios.get(API_URL, getAuthHeader());
  return response.data;
};

export const getProductById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

export const createProduct = async (productData) => {
  console.log("createProduct fonksiyonu çağrıldı", productData);
  const response = await axios.post(API_URL, productData, getAuthHeader());
  console.log("createProduct response", response);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await axios.put(`${API_URL}/${id}`, productData, getAuthHeader());
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

export const getProductsByProducer = async (producerId) => {
  const response = await axios.get(`${API_URL}/producer/${producerId}`, getAuthHeader());
  return response.data;
};

export const getProductsByStatus = async (status) => {
  const response = await axios.get(`${API_URL}/status/${status}`, getAuthHeader());
  return response.data;
};

export const getProductByBatchNumber = async (batchNumber) => {
  const response = await axios.get(`${API_URL}/batch/${batchNumber}`, getAuthHeader());
  return response.data;
}; 