// API base URL - change to your deployed backend URL for production
const String kApiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://10.0.2.2:3000', // Android emulator -> host
);

// For iOS simulator: 'http://localhost:3000'
// For real device on same WiFi: 'http://<your-machine-ip>:3000'
// For deployed backend: 'https://your-api.onrender.com'
