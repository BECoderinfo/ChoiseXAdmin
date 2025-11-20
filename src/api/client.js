const API_BASE_URL = "https://choisex.com/api";

let FILE_BASE_URL = API_BASE_URL;
try {
  const parsed = new URL(API_BASE_URL);
  const trimmedPath = parsed.pathname.replace(/\/api\/?$/, "");
  FILE_BASE_URL = `${parsed.origin}${trimmedPath}`;
} catch {
  FILE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");
}

async function request(path, options = {}) {
  const { headers, ...rest } = options;
  const isFormData = rest.body instanceof FormData;

  // Get token from localStorage
  const token = localStorage.getItem("authToken");

  // Build headers
  const requestHeaders = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(headers || {}),
  };

  // Add Bearer token if available
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
  });

  const contentType = response.headers.get("content-type");
  const payload =
    contentType && contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      // Clear token from localStorage
      localStorage.removeItem("authToken");
      // Redirect to login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    const message = payload?.message || "Something went wrong";
    throw new Error(message);
  }

  return payload;
}

function buildAssetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${FILE_BASE_URL}${path}`;
}

export { request, API_BASE_URL, FILE_BASE_URL, buildAssetUrl };

