// Test API connectivity
const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

console.log('Testing API connection to:', apiBase);

// Test basic health check
fetch(`${apiBase}/v1/users`)
  .then(response => {
    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', response.headers);
    return response.json();
  })
  .then(data => {
    console.log('API Response Data:', data);
  })
  .catch(error => {
    console.error('API Error:', error);
  });
