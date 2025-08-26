import axios from 'axios';

// 🛑 IMPORTANT: Replace with your computer's local IP address from Step 1
const YOUR_COMPUTER_IP_ADDRESS = '192.168.1.5'; // Example IP, change this!

// The port should match the one your Spring Boot server is running on (usually 8080)
const API_BASE_URL = `http://$192.168.1.216:8080`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;