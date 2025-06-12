import axios from 'axios';
const API_URL = 'http://localhost:8080/api/blocks';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const getBlocks = async () => (await axios.get(API_URL, getAuthHeaders())).data;
export const validateChain = async () => (await axios.get(`${API_URL}/validate`, getAuthHeaders())).data;
export const receiveChain = async (chain) => (await axios.post(`${API_URL}/receive`, chain, getAuthHeaders())).data; 