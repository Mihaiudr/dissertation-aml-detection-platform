import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const TOKEN_KEY = "aml_guard_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders() {
  const token = getToken();

  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function registerUser(payload) {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, payload);

  return response.data;
}

export async function loginUser({ username, password }) {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const response = await axios.post(`${API_BASE_URL}/auth/login`, formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  saveToken(response.data.access_token);

  return response.data;
}

export async function getCurrentUser() {
  const response = await axios.get(`${API_BASE_URL}/auth/me`, {
    headers: authHeaders(),
  });

  return response.data;
}

export async function uploadTransactions(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    `${API_BASE_URL}/predict-batch`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        ...authHeaders(),
      },
    }
  );

  return response.data;
}

export async function scoreDemoDataset() {
  const response = await axios.post(
    `${API_BASE_URL}/predict-demo`,
    {},
    {
      headers: authHeaders(),
    }
  );

  return response.data;
}

export async function generateExplanation(alert) {
  const response = await axios.post(
    `${API_BASE_URL}/explain-alert`,
    alert,
    {
      headers: authHeaders(),
    }
  );

  return response.data;
}
