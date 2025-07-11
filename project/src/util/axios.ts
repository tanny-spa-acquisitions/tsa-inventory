import axios from "axios";
import { BACKEND_URL } from "./config";

export const makeRequest = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, 
});