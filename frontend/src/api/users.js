import api from './axios';

export const getUsers = async (params = {}) => {
  const response = await api.get('/v1/users', { params });
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/v1/users', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/v1/users/${id}`, userData);
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await api.patch(`/v1/users/${id}/role`, null, { params: { role } });
  return response.data;
};

export const updateUserStatus = async (id, status) => {
  const response = await api.patch(`/v1/users/${id}/status`, null, { params: { status } });
  return response.data;
};

export const resetUserPassword = async (id, newPassword) => {
  const response = await api.patch(`/v1/users/${id}/password`, null, { params: { newPassword } });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/v1/users/${id}`);
  return response.data;
};
