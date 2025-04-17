import axios from "axios";

export const axiosInstance = axios.create({})

export const apiConnecter = (method, url, bodyData = null, headers = {}, params = null) => {
    return axiosInstance({
        method: method, // HTTP method (e.g., GET, POST)
        url: url,       // Endpoint URL
        data: bodyData, // Request body for POST, PUT, etc.
        headers: headers, // Additional headers
        params: params, // Query parameters for GET requests
    });
};