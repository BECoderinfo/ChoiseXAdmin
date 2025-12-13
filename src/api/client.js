// const API_BASE_URL = "https://choisex.com/api";
const API_BASE_URL="https://choisex.com/api" //http://localhost:5000/api

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
  let token = localStorage.getItem("authToken");

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
      const errorCode = payload?.code;
      
      // If token expired, try to refresh it
      if (errorCode === "TOKEN_EXPIRED") {
        const refreshToken = localStorage.getItem("refreshToken");
        
        if (refreshToken) {
          try {
            // Try to refresh the token
            const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ refreshToken }),
            });

            const refreshPayload = refreshResponse.ok && refreshResponse.headers.get("content-type")?.includes("application/json")
              ? await refreshResponse.json()
              : null;

            if (refreshResponse.ok && refreshPayload?.accessToken) {
              // Update token in localStorage
              localStorage.setItem("authToken", refreshPayload.accessToken);
              
              // Retry the original request with new token
              const retryHeaders = {
                ...requestHeaders,
                Authorization: `Bearer ${refreshPayload.accessToken}`,
              };

              const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
                ...rest,
                headers: retryHeaders,
              });

              const retryContentType = retryResponse.headers.get("content-type");
              const retryPayload =
                retryContentType && retryContentType.includes("application/json")
                  ? await retryResponse.json()
                  : null;

              if (retryResponse.ok) {
                return retryPayload;
              }
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
          }
        }
      }

      // Clear tokens from localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      
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

