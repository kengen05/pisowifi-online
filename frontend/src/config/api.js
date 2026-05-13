/**
 * API Configuration
 * Dynamically determines the backend URL based on the environment
 */

// Get the backend URL from environment or determine it dynamically
export function getBackendUrl() {
  // First check for environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // If accessing from a non-localhost address, construct URL from the current host
  const currentHost = window.location.hostname;
  const port = 5000;

  // If already on a non-localhost address (network IP)
  if (currentHost !== "localhost" && currentHost !== "127.0.0.1") {
    return `http://${currentHost}:${port}`;
  }

  // Default to localhost
  return "http://localhost:5000";
}

// Export a function to construct full URLs
export function getApiUrl(path) {
  const baseUrl = getBackendUrl();
  return `${baseUrl}${path.startsWith("/") ? path : "/" + path}`;
}

// Log current configuration (helpful for debugging)
export function logApiConfig() {
  console.log("API Configuration:");
  console.log(`  Backend URL: ${getBackendUrl()}`);
  console.log(`  Current hostname: ${window.location.hostname}`);
  console.log(
    `  Network access info: Visit http://<your-machine-ip>:3000 to test from another device`
  );
}
