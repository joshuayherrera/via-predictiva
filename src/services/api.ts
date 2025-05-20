import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const fetchPrediction = (lat: number, lng: number, hora: number | string) =>
  API.get(`/predict?lat=${lat}&lng=${lng}&hora=${hora}`);

export const fetchHistory = (lat: number, lng: number) =>
  API.get(`/history?lat=${lat}&lng=${lng}`);