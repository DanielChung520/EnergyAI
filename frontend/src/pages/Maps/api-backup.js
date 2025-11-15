// API URL 配置
export const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5500'
  : `${window.location.protocol}//${window.location.hostname}/api`;

// 創建統一的 axios 實例
import axios from 'axios';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}); 