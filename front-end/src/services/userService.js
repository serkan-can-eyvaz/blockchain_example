import axios from 'axios';

const API_URL = 'http://localhost:8080/api/users';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getCurrentUser = async () => {
  const response = await axios.get(`${API_URL}/me`, getAuthHeader());
  return response.data;
};

export const updateUser = async (userData) => {
  const response = await axios.put(`${API_URL}/me`, userData, getAuthHeader());
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await axios.put(`${API_URL}/me/password`, passwordData, getAuthHeader());
  return response.data;
}; 